import {
  $query,
  $update,
  Record,
  StableBTreeMap,
  Vec,
  match,
  Result,
  nat64,
  ic,
  Opt,
  float64,
  Principal
} from "azle";
import { v4 as uuidv4 } from "uuid";

type Family = Record<{
  id: string;
  name: string;
  members: Vec<string>;
  address: string;
  createdBy: Principal; // Add the creator's principal
  createdAt: nat64;
  updatedAt: Opt<nat64>;
}>;

type FamilyPayload = Record<{
  name: string;
  members: Vec<string>;
  address: string;
}>;

type FamilyExpense = Record<{
  id: string;
  familyId: string;
  amount: string;
  attachmentURL: string;
  createdAt: nat64;
}>;

type FamilyExpensePayload = Record<{
  familyId: string;
  amount: string;
  attachmentURL: string;
}>;

const familyStorage = new StableBTreeMap<string, Family>(0, 44, 1024);
const familyExpensesStorage = new StableBTreeMap<string, FamilyExpense>(
  1,
  44,
  1024
);

globalThis.crypto = {
  getRandomValues: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }
};

$query;
export function getFamilies(): Result<Vec<Family>, string> {
  return Result.Ok(familyStorage.values());
}

$query;
export function getFamily(id: string): Result<Family, string> {
  return match(familyStorage.get(id), {
    Some: (family) => Result.Ok<Family, string>(family),
    None: () => Result.Err<Family, string>(`Family with id=${id} not found.`)
  });
}

$query;
export function getFamilyExpenses(familyId: string): Result<Vec<FamilyExpense>, string> {
  const familyExpenses = familyExpensesStorage.values().filter(familyExpense =>
    familyExpense.familyId === familyId
  );
  return Result.Ok(familyExpenses);
}

$update;
export function addFamily(payload: FamilyPayload): Result<Family, string> {
  const caller = ic.provisional_create_canister(
    { controller: ic.caller() }
  );
  const family: Family = {
    id: uuidv4(),
    createdBy: caller,
    createdAt: ic.time(),
    updatedAt: Opt.None,
    ...payload
  };
  familyStorage.insert(family.id, family);
  return Result.Ok(family);
}

$update;
export function updateFamily(id: string, payload: FamilyPayload): Result<Family, string> {
  const caller = ic.provisional_create_canister(
    { controller: ic.caller() }
  );
  return match(familyStorage.get(id), {
    Some: (family) => {
      if (caller != family.createdBy) {
        return Result.Err<Family, string>(
          `You don't have permission to update this family.`
        );
      }

      const updatedFamily: Family = {
        ...family,
        ...payload,
        updatedAt: Opt.Some(ic.time())
      };
      familyStorage.insert(family.id, updatedFamily);
      return Result.Ok<Family, string>(updatedFamily);
    },
    None: () => Result.Err<Family, string>(`Family with id=${id} not found.`)
  });
}

$update;
export function addFamilyExpense(payload: FamilyExpensePayload): Result<FamilyExpense, string> {
  const family = familyStorage.get(payload.familyId);
  if (!family) {
    return Result.Err(`Family with id=${payload.familyId} not found.`);
  }

  const familyExpense: FamilyExpense = {
    id: uuidv4(),
    createdAt: ic.time(),
    ...payload
  };
  familyExpensesStorage.insert(familyExpense.id, familyExpense);
  return Result.Ok(familyExpense);
}

$update;
export function deleteFamily(id: string): Result<Family, string> {
  const caller = ic.provisional_create_canister(
    { controller: ic.caller() }
  );
  const family = familyStorage.get(id);
  if (!family) {
    return Result.Err<Family, string>(`Family with id=${id} not found.`);
  }

  if (caller != family.createdBy) {
    return Result.Err<Family, string>(
      `You don't have permission to delete this family.`
    );
  }

  familyStorage.remove(id);
  return Result.Ok<Family, string>(family);
}

$update;
export function deleteFamilyExpense(id: string): Result<FamilyExpense, string> {
  const familyExpense = familyExpensesStorage.remove(id);
  if (!familyExpense) {
    return Result.Err<FamilyExpense, string>(
      `Family expense with id=${id} not found.`
    );
  }
  return Result.Ok<FamilyExpense, string>(familyExpense);
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    // @ts-ignore
   getRandomValues: () => {
       let array = new Uint8Array(32)

       for (let i = 0; i < array.length; i++) {
           array[i] = Math.floor(Math.random() * 256)
       }

       return array
   }
}
