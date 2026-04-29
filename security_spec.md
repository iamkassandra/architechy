# Security Specification: ARCHITECH Elite System

## Data Invariants
1. **Purchase Integrity**: A user can only access a product's digital link if they have a 'completed' purchase record linked to their UID.
2. **Reading List Isolation**: Users can only see and modify their own reading lists.
3. **Identity Protection**: Users cannot modify their own `role` or high-level system metadata.
4. **Newsletter Privacy**: Only admins can list all newsletter subscribers; users can only add themselves.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Identity Spoofing**: Attempt to create a user profile with `userId` of a target admin.
2. **Privilege Escalation**: Update user profile to set `role: 'admin'`.
3. **Shadow Field Injection**: Create a purchase with `isVerified: true` manually.
4. **Relational Bypass**: Create a reading list item for another user's `userId`.
5. **ID Poisoning**: Create a product with a 1MB junk string as the ID.
6. **Immutable Tampering**: Update a `Purchase` record to change the `productId` after creation.
7. **Cross-User Leak**: Authenticated User A attempts to list all `purchases` without filtering by their own `userId`.
8. **PII Scraping**: Attempt to `get()` another user's private email from the `/users/` collection.
9. **Terminal State Break**: Attempt to update a 'completed' purchase back to 'pending'.
10. **Timestamp Fraud**: Send a `createdAt` value from the future (client time) instead of `request.time`.
11. **Empty Key Injection**: Create a `User` with only an email and no UID.
12. **Regex Bypass**: Use a document ID containing malicious scripts or illegal characters.

## Test Suite Execution
Target: `firestore.rules` must be verified against these targets to ensure `PERMISSION_DENIED` for all above.
