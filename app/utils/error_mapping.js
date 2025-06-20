const errorMapping = {
    VALIDATION_ERROR: 1,
    USER_NOT_FOUND: 2,
    INVALID_ROLE: 3,
    INSUFFICIENT_PERMISSIONS: 4,
    INVALID_USERS_CREDENTIALS: 5,
    INVALID_USER_PASSWORD: 6,
    PASSWORDS_NOT_MATCHED: 7,
    CONFLICT_DUPLICATE_KEY_ERROR: 8,
    INVALID_EMAIL_TYPE: 9,
    API_ENDPOINT_NOT_FOUND: 10,
    USER_NOT_VERIFIED: 11,
    INVALID_TOKEN: 12,
    CONFLICT_DUPLICATE_KEY_ERROR_EMAIL: 13,
    CONFLICT_DUPLICATE_KEY_ERROR_KEYCLOAKID: 14,
    FORBIDDEN_RESOURCE: 15,
    INVALID_REFRESH_TOKEN: 16,
    INVALID_ACTION_UPDATE_USER_PASSWORD: 17,
    VERIFICATION_CODE_NOT_FOUND: 18,
    USER_VERIFIED: 19,
    CONFLICT_DUPLICATE_KEY_ERROR_CODE: 20,
    START_DATE_INVALID: 21,
    END_DATE_INVALID: 22,
    CAMPAIGN_NOT_FOUND: 23,
    INACTIVE_CAMPAIGN_UPDATE_ERROR: 24,
    EXPIRED_CAMPAIGN_UPDATE_ERROR: 25,
    ACTIVE_CAMPAIGN_UPDATE_ERROR: 26,
    READY_CAMPAIGN_UPDATE_ERROR: 27,
    PENDENT_CAMPAIGN_UPDATE_ERROR: 28,
    CONFLICT_DUPLICATE_KEY_ERROR_CPF: 29,
    USER_FOUND_MYCASH: 30,
    USER_FOUND_BANNEDLIST: 31,
    SALE_NOT_MATCH_ANY_CAMPAIGN: 32,
    EMAIL_NOT_MATCH: 33,
    SALE_NOT_FOUND: 34,
    INSUFFICIENT_FUNDS: 35,
    CONFLICT_DUPLICATE_INVOICE_KEY_ERROR: 36,
    CANT_CANCEL_AVAILABLE_SALE: 37,
    CANT_CANCEL_EXPIRED_SALE: 38,
    VALIDATION_ERROR_INVOICEKEY_REQUIRED: 39,
    VTEX_ORDER_NOT_FOUND: 40,
    CONFLICT_DUPLICATE_ORIGIN_KEY: 41,
    CONFLICT_DUPLICATE_ORIGIN_TYPE_KEY: 42,
    ORIGIN_NOT_FOUND: 43,
    ORIGIN_TYPE_NOT_FOUND: 44,
    FAIL_NOT_VALID_CUSTOMER_CAMPAIGN: 45,
    GIFTCARD_NOT_FOUND: 46,
    INVOICE_ALREADY_PARTIALLY_CANCELED: 47,
    INVOICE_PARTIALLY_CANCELED_SALE_ITEM_NOT_FOUND: 48,
    QUANTITY_CANCELED_GREATER_THAN_SOLD: 49,
    CANCELED_QUANTITY_MUST_BE_GREATER_THAN_ZERO: 50,
    INVALID_USED_CASHBACK_VALUE: 51,
    CREATE_EMPLOYEES_ERROR: 52,
    CREATE_BONUS_REQUEST_ERROR: 53,
    CANCEL_BONUS_REQUEST_ERROR: 54,
    REQUEST_NOT_FOUND: 55,
    REQUEST_REFUSED: 56,
    REQUEST_AVAILABLE: 57,
    USER_NOT_EMPLOYEE: 58,
    EDIT_EMPLOYEE_ERROR: 59,
    EMPLOYEE_NOT_FOUND: 60,
    PARTIAL_DELETE_VOUCHERS_ERROR: 61,
    DELETE_VOUCHERS_ERROR: 62,
    VOUCHER_NOT_FOUND: 63,
    CANT_DELETE_LIST_VOUCHER: 64,
    CANT_DELETE_USED_VOUCHER: 65,
    CANT_APPROVE_LIST_VOUCHER: 66,
    CANT_APPROVE_DRAFT_VOUCHER: 67,
    CANT_APPROVE_DELETED_VOUCHER: 68,
    CANT_APPROVE_INVALID_STATUS_VOUCHER: 69,
    PARTIAL_APPROVE_VOUCHERS_ERROR: 70,
    APPROVE_VOUCHERS_ERROR: 71,
    CANT_REFUSE_LIST_VOUCHER: 72,
    CANT_REFUSE_DRAFT_VOUCHER: 73,
    CANT_REFUSE_DELETED_VOUCHER: 74,
    CANT_REFUSE_USED_VOUCHER: 75,
    PARTIAL_REFUSE_VOUCHERS_ERROR: 76,
    REFUSE_VOUCHERS_ERROR: 77,
    DATE_NOT_VALID: 78,
    ORIGIN_BALANCE_NOT_FOUND: 79,
    CANT_APPROVE_OWN_VOUCHER: 80,
    ORIGIN_RULE_NOT_FOUND: 81,
    EDIT_ORIGIN_RULE_ERROR: 82,
    DELETE_ORIGIN_RULE_ERROR: 83,
    ALL_FIELDS_ARE_MANDATORY: 84,
    CONFLICT_DUPLICATE_VOUCHER_NAME: 85,
    CONFLICT_DUPLICATE_PARTNER_CNPJ: 86,
    PARTNER_NOT_FOUND: 87,
    UNABLE_TO_INACTIVATE_PARTNER: 88,
    PARTNER_IS_ALREADY_INACTIVATED: 89,
    PARTNER_IS_ALREADY_ACTIVE: 90,
    UNABLE_TO_REACTIVATED_PARTNER: 91,
    UF_NOT_FOUND_IN_URL: 92,
    UNABLE_TO_CREATE_PARTNER: 93,
    UNABLE_TO_OBTAIN_INVOICE_DETAILS: 94
};

export default errorMapping;
