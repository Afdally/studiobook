# Security Specification: StudioBook Firestore Rules

## 1. Data Invariants
- **Packages & Addons**: Read-Only for public customers. Create, Update, Delete are restricted to authenticated administrators.
- **Bookings**: Anyone (even unauthenticated users) can create a booking to make the system accessible to new visitors. However, they must supply valid structural fields matching the schema, and cannot overwrite or delete other bookings.
- **Settings & Slots**: Ready-Only for public customers. Modifications are strictly restricted to administrators.
- **Expenses**: Read and write operations are restricted exclusively to administrators. Customer profiles have zero access to expense documents.

## 2. The "Dirty Dozen" Payloads (Aesthetic TDD Specs)
Below are 12 malicious payloads that MUST be rejected (`PERMISSION_DENIED`) by the security rules:
1. **Public Package Injection**: Write to `/packages/test-pkg` by an unauthenticated client.
2. **Public Package Deletion**: Delete request to `/packages/portrait-solo` by an unauthenticated client.
3. **Public Addon Injection**: Write to `/addons/magic-extra` by an unauthenticated client.
4. **Invalid Booking State Modification**: Attempting to update a booking status to "LUNAS" (paid) by an unauthenticated customer.
5. **Malicious Booking Overwrite**: Overwriting a booking created by someone else by injecting a huge string ID.
6. **Booking Deletion**: Attempt by an unauthenticated client to delete a booking under `/bookings/BK-XXXX`.
7. **Public Settings Modification**: Public client attempting to overwrite `/settings/studio` with a custom bank account.
8. **Public Slots Blocked Date Modification**: Public client attempting to insert blocked dates into `/settings/slots`.
9. **Public Expense Access**: Public customer attempting to read `/expenses/exp-1` document.
10. **Public Expense Injection**: Public customer trying to write an expense item to `/expenses/exp-toxic`.
11. **Toxic ID Poisoning**: Write to a booking using a document path containing non-alphanumeric Characters (e.g., `/bookings/BK-*!!*`).
12. **Null Timestamp Bypassing**: Client trying to post a custom time in `createdAt` instead of using the server's authoritative `request.time`.

## 3. Test Runner Strategy
Since this is an applet running with fully-integrated cloud containers, we execute schema verification and security validation programmatically. All of the above scenarios are blocked by the security constraints below.
