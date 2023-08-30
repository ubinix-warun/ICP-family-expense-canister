# family-expense-canister
Simple app for tracking family expenses with ICP and canister.

## Use Case

1. This application can be used by users that want to track their family expenses.
2. Anyone from the family can freely see the expenses data on the blockchain.

## Execution

The project runs on [AZLE](https://demergent-labs.github.io/azle/the_azle_book.html). To test:

- clone the repo

```
git clone https://github.com/Vitomir2/family-expense-canister.git
```

- cd to the family-expense-canister and install the dependencies

```
cd family-expense-canister
```

```
npm install
```

- then run the following commands to start the icp blockchain locally and deploy the canister

```
    dfx start --background --clean
    dfx deploy
```

- then you can make calls to the canister and its methods (getFamilies, getFamily, getFamilyExpenses, addFamily, updateFamily, addFamilyExpense, deleteFamily). Here are some example CLI commands:

1. add a family:
```
dfx canister call family_expense addFamily '(record {"name"= "Smith"; "members"= vec { "John"; "Jane"; "Chris"; "Kerry" }; "address"= "153 Linkoln St., DC, Washington"})'
```

2. get a specific family
```
dfx canister call family_expense getFamily '("<family.id>")'
```

3. get all families
```
dfx canister call family_expense getFamilies '()'
```

4. add new expense
```
dfx canister call family_expense addFamilyExpense '(record {"familyId"= "<family.id>"; "amount"= "105.60"; "attachmentURL"= "url/path/to/some/photo/attachment"})'
```

5. get a family expenses
```
dfx canister call family_expense getFamilyExpenses '("<family.id>")'
```

6. delete a family
```
dfx canister call family_expense deleteFamily '("<family.id>")'
```

7. delete a family expense
```
dfx canister call family_expense deleteFamilyExpense '("<family.id>")'
```