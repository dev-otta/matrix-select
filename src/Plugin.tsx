import React from 'react'
import { IFormFieldPluginProps } from './Plugin.types'
import styles from '@/Plugin.module.css'

const getOptionSetSignature = (meta: any): string | null =>
    meta?.optionSet?.options
        ?.map((o: any) => o.code)
        .sort()
        .join(',') ?? null

const Plugin = ({
    values,
    fieldsMetadata,
    setFieldValue,
    viewMode,
}: IFormFieldPluginProps) => {
    const safeFieldsMetadata = fieldsMetadata ?? {}

    const fields = Object.entries(safeFieldsMetadata).filter(
        ([_, meta]) => meta?.optionSet != null
    )

    const title = safeFieldsMetadata['title']?.formName

    if (fields.length === 0) {
        return (
            <div className={styles.root}>
                <p className={styles.empty}>No fields to display.</p>
            </div>
        )
    }

    const firstSignature = getOptionSetSignature(fields[0][1])
    const allSameOptionSet = fields.every(
        ([_, meta]) => getOptionSetSignature(meta) === firstSignature
    )

    if (!allSameOptionSet) {
        return (
            <div className={styles.root}>
                <p className={styles.error}>
                    Configuration error: all fields must share the same option
                    set.
                </p>
            </div>
        )
    }

    const firstMeta = fields[0][1]
    const options = firstMeta?.optionSet?.options ?? []
    const isMultiSelect = firstMeta?.type === 'MULTI_TEXT'

    if (options.length === 0) {
        return (
            <div className={styles.root}>
                <p className={styles.empty}>No options available.</p>
            </div>
        )
    }

    const handleChange = (fieldId: string, optCode: string) => {
        if (isMultiSelect) {
            const current = values[fieldId]?.split(',') ?? []
            const updated = current.includes(optCode)
                ? current.filter((v) => v !== optCode)
                : [...current, optCode]
            setFieldValue({ fieldId, value: updated.join(',') })
        } else {
            setFieldValue({ fieldId, value: optCode })
        }
    }

    return (
        <div className={styles.root}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th />
                            {options.map((opt) => (
                                <th
                                    key={opt.code}
                                    className={styles.headerCell}
                                    data-fulltext={opt.text}
                                >
                                    <span className={styles.headerText}>
                                        {opt.text}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {fields.map(([fieldId, meta]) => (
                            <tr className={styles.row} key={fieldId}>
                                <td className={styles.labelCell}>
                                    {meta.formName}
                                </td>
                                {options.map((opt) => {
                                    const checked = isMultiSelect
                                        ? (values[fieldId]
                                              ?.split(',')
                                              .includes(opt.code) ?? false)
                                        : values[fieldId] === opt.code
                                    return (
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
                                                name={`${fieldId}-radio`}
                                                disabled={viewMode}
                                                checked={checked}
                                                onChange={() =>
                                                    handleChange(
                                                        fieldId,
                                                        opt.code
                                                    )
                                                }
                                            />
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Plugin
