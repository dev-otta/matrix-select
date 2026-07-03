type OptionSetOption = {
    code: string
    text: string
}
type OptionSet = {
    options?: OptionSetOption[]
}

type fieldsMetadata = {
    id: string
    name: string
    shortName: string
    formName: string
    disabled: boolean
    compulsory: boolean
    description: string
    type: string
    optionSet: OptionSet
    displayInForms: boolean
    displayInReports: boolean
    icon: unknown
    unique: unknown
    searchable: boolean | undefined
    url: string | undefined
}

type FieldValue = string | undefined

type FieldValueOptions = {
    valid?: boolean
    touched?: boolean
    error?: string
}

type SetFieldValueProps = {
    fieldId: string
    value: FieldValue
    options?: FieldValueOptions
}

type SetContextFieldValueProps = {
    fieldId: 'geometry' | 'occurredAt' | 'enrolledAt'
    value: string | undefined
    options?: FieldValueOptions
}

export type IFormFieldPluginProps = {
    values: Record<string, string | undefined>
    errors: Record<string, string[]>
    warnings: Record<string, string[]>
    fieldsMetadata: Record<string, fieldsMetadata>
    setFieldValue: (values: SetFieldValueProps) => void
    setContextFieldValue: (values: SetContextFieldValueProps) => void
    viewMode: boolean
    formSubmitted: boolean
}
