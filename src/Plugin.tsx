import React from 'react'
import { IFormFieldPluginProps } from './Plugin.types'
import styles from '@/Plugin.module.css'

// assumes the plugin only retrieves exactly the fields that shares the same option set and will make up the single matrix select
const Plugin = ({
    values,
    fieldsMetadata,
    setFieldValue,
    viewMode,
}: IFormFieldPluginProps) => {
    const fields = Object.entries(fieldsMetadata).filter(
        ([_, meta]) => meta?.optionSet != null
    )
    const optionSet = fields[0]?.[1]?.optionSet
    const options = optionSet?.options ?? []
    const isMultiSelect = fields[0]?.[1]?.type === 'MULTI_TEXT'

    console.log('fields', fields)
    console.log('values', values)
    console.log('optionSet', optionSet)
    console.log('options', options)

    const handleChange = (fieldId: string, opt: any) => {
        if (isMultiSelect) {
            const currentValues = values[fieldId]
                ? values[fieldId].split(',')
                : []
            const newValues = currentValues.includes(opt.code)
                ? currentValues.filter((v) => v !== opt.code)
                : [...currentValues, opt.code]
            setFieldValue({
                fieldId,
                value: newValues.join(','),
            })
        } else {
            setFieldValue({
                fieldId,
                value: opt.code,
            })
        }
    }

    return (
        <div className={styles.root}>
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th />

                            {options.map((opt) => (
                                <th key={opt.code}>{opt.text}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map(([fieldId, meta]) => (
                            <tr key={fieldId}>
                                <td className={styles.labelCell}>
                                    {meta.formName}
                                </td>
                                {options.map((opt) => (
                                    <td
                                        key={opt.code}
                                        className={styles.inputCell}
                                    >
                                        <input
                                            className={styles.input}
                                            type={
                                                isMultiSelect
                                                    ? 'checkbox'
                                                    : 'radio'
                                            }
                                            disabled={viewMode}
                                            checked={Boolean(
                                                isMultiSelect
                                                    ? values[fieldId]
                                                          ?.split(',')
                                                          .includes(opt.code)
                                                    : values[fieldId] ===
                                                          opt.code
                                            )}
                                            onChange={() =>
                                                handleChange(fieldId, opt)
                                            }
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Plugin
