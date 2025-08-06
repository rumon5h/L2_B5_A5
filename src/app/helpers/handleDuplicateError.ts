import { TGenericErrorResponse } from "../interfaces/error.types"

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
    const matchedArray = err.message.match(/"([^"]*)"/)
    const duplicateValue = matchedArray?.[1] || "Field"

    return {
        statusCode: 400,
        message: `${duplicateValue} already exists!!`
    }
}