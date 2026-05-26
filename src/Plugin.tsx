import React, { useState, useCallback } from 'react'
import { IFormFieldPluginProps } from './Plugin.types'
import { Tooltip, TooltipState } from './Tooltip'
import styles from '@/Plugin.module.css'

type OptionSetOption = { code: string }
type OptionSetMeta = { optionSet?: { options?: OptionSetOption[] } }

const getOptionSetSignature = (meta: OptionSetMeta): string | null =>
    meta?.optionSet?.options
        ?.map((o: OptionSetOption) => o.code)
        .sort()
        .join(',') ?? null

const Plugin = ({
    values,
    fieldsMetadata,
    setFieldValue,
    viewMode,
}: IFormFieldPluginProps) => {
    const safeFieldsMetadata = fieldsMetadata ?? {}
    const [tooltip, setTooltip] = useState<TooltipState | null>(null)

    const fields = Object.entries(safeFieldsMetadata).filter(
        ([, meta]) => meta?.optionSet != null
    )

    const title = safeFieldsMetadata['title']?.formName
    const firstSignature =
        fields.length > 0 ? getOptionSetSignature(fields[0][1]) : null
    const allSameOptionSet =
        fields.length === 0 ||
        fields.every(
            ([, meta]) => getOptionSetSignature(meta) === firstSignature
        )
    const firstMeta = fields[0]?.[1]
    const options = firstMeta?.optionSet?.options ?? []
    const isMultiSelect = firstMeta?.type === 'MULTI_TEXT'

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLTableCellElement>, text: string) => {
            const span = e.currentTarget.querySelector<HTMLSpanElement>(
                `.${styles.headerText}`
            )
            if (!span || span.scrollHeight <= span.clientHeight) {
                return
            }
            const rect = e.currentTarget.getBoundingClientRect()
            setTooltip({
                text,
                x: rect.left + rect.width / 2,
                y: rect.bottom + 6,
            })
        },
        []
    )

    const handleMouseLeave = useCallback(() => setTooltip(null), [])

    if (fields.length === 0) {
        return (
            <div className={styles.root}>
                <p className={styles.empty}>No fields to display.</p>
            </div>
        )
    }

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
            <div className={styles.tableWrap}>
                <fieldset disabled={viewMode} className={styles.fieldset}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.titleCell}>
                                    <span className={styles.title}>
                                        {title}
                                    </span>
                                </th>
                                {options.map((opt) => (
                                    <th
                                        key={opt.code}
                                        className={styles.headerCell}
                                        onMouseEnter={(e) =>
                                            handleMouseEnter(e, opt.text)
                                        }
                                        onMouseLeave={handleMouseLeave}
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
                </fieldset>
            </div>
            {tooltip && <Tooltip {...tooltip} />}
        </div>
    )
}

export default Plugin
