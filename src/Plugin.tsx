import i18n from '@dhis2/d2-i18n'
import {
    Checkbox,
    colors,
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableRow,
    NoticeBox,
    Radio,
} from '@dhis2/ui'
import React, { useState, useCallback, useEffect, useRef } from 'react'
import { IFormFieldPluginProps } from './Plugin.types'
import { Tooltip, TooltipState } from './Tooltip'
import styles from '@/Plugin.module.css'

// @dhis2/ui types `left` as boolean, but the runtime uses it as a CSS inset value
const FixedDataTableCell = DataTableCell as React.ForwardRefExoticComponent<
    Omit<React.ComponentProps<typeof DataTableCell>, 'left'> & {
        left?: string
    }
>

type OptionSetOption = { code: string }
type OptionSetMeta = { optionSet?: { options?: OptionSetOption[] } }

const getOptionSetSignature = (meta: OptionSetMeta): string | null =>
    meta?.optionSet?.options
        ?.map((o: OptionSetOption) => o.code)
        .sort()
        .join(',') ?? null

const formatSelectedLabels = (
    value: string | undefined,
    options: { code: string; text: string }[],
    isMultiSelect: boolean
): string => {
    if (!value) return ''

    const codes = isMultiSelect
        ? value
              .split(',')
              .map((c) => c.trim())
              .filter(Boolean)
        : [value]

    return codes
        .map((code) => options.find((o) => o.code === code)?.text ?? code)
        .join(', ')
}

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
    const SelectControl = isMultiSelect ? Checkbox : Radio

    const tooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent<HTMLTableCellElement>, text: string) => {
            if (tooltipTimer.current) {
                clearTimeout(tooltipTimer.current)
                tooltipTimer.current = null
            }
            const span = e.currentTarget.querySelector<HTMLSpanElement>(
                `.${styles.headerText}`
            )
            if (!span || span.scrollHeight <= span.clientHeight) {
                return
            }
            const rect = e.currentTarget.getBoundingClientRect()
            tooltipTimer.current = setTimeout(() => {
                setTooltip({
                    text,
                    x: rect.left + rect.width / 2,
                    y: rect.bottom + 6,
                })
            }, 400)
        },
        []
    )

    const handleMouseLeave = useCallback(() => {
        if (tooltipTimer.current) {
            clearTimeout(tooltipTimer.current)
            tooltipTimer.current = null
        }
        setTooltip(null)
    }, [])

    useEffect(
        () => () => {
            if (tooltipTimer.current) {
                clearTimeout(tooltipTimer.current)
            }
        },
        []
    )

    if (fields.length === 0) {
        return (
            <div className={styles.root}>
                <NoticeBox>{i18n.t('No fields to display.')}</NoticeBox>
            </div>
        )
    }

    if (!allSameOptionSet) {
        return (
            <div className={styles.root}>
                <NoticeBox error title={i18n.t('Configuration error')}>
                    {i18n.t('All fields must share the same option set.')}
                </NoticeBox>
            </div>
        )
    }

    if (options.length === 0) {
        return (
            <div className={styles.root}>
                <NoticeBox>{i18n.t('No options available.')}</NoticeBox>
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

    if (viewMode) {
        return (
            <div className={styles.root}>
                <div
                    className={`${styles.summaryWrap} ${title ? styles.summaryWrapWithTitle : ''}`}
                >
                    {title && <h3 className={styles.summaryTitle}>{title}</h3>}
                    <ul className={styles.summaryList}>
                        {fields.map(([fieldId, meta]) => {
                            const label = formatSelectedLabels(
                                values[fieldId],
                                options,
                                isMultiSelect
                            )
                            return (
                                <li
                                    key={fieldId}
                                    className={styles.summaryItem}
                                >
                                    <span className={styles.summaryLabel}>
                                        {meta.formName}
                                    </span>
                                    <span
                                        className={`${styles.summaryValue} ${!label ? styles.summaryEmpty : ''}`}
                                    >
                                        {label}
                                    </span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.root}>
            <DataTable
                scrollWidth="100%"
                className={`${styles.tableWrap} ${title ? styles.tableWrapWithTitle : ''}`}
            >
                <DataTableHead>
                    <DataTableRow>
                        <FixedDataTableCell
                            tag="th"
                            fixed
                            left="0"
                            width="40cqw"
                            backgroundColor={colors.grey050}
                            className={styles.titleCell}
                        >
                            <span className={styles.title}>{title}</span>
                        </FixedDataTableCell>
                        {options.map((opt) => (
                            <DataTableCell
                                key={opt.code}
                                tag="th"
                                align="center"
                                backgroundColor={colors.grey050}
                                className={styles.headerCell}
                                onMouseEnter={(e) =>
                                    handleMouseEnter(e, opt.text)
                                }
                                onMouseLeave={handleMouseLeave}
                            >
                                <span className={styles.headerText}>
                                    {opt.text}
                                </span>
                            </DataTableCell>
                        ))}
                    </DataTableRow>
                </DataTableHead>
                <DataTableBody>
                    {fields.map(([fieldId, meta], index) => {
                        const rowBackground =
                            index % 2 === 0 ? colors.grey050 : colors.white
                        const selectedCodes = isMultiSelect
                            ? new Set(values[fieldId]?.split(',') ?? [])
                            : null
                        return (
                            <DataTableRow key={fieldId}>
                                <FixedDataTableCell
                                    fixed
                                    left="0"
                                    width="40cqw"
                                    backgroundColor={rowBackground}
                                    className={styles.labelCell}
                                >
                                    {meta.formName}
                                </FixedDataTableCell>
                                {options.map((opt) => {
                                    const checked = selectedCodes
                                        ? selectedCodes.has(opt.code)
                                        : values[fieldId] === opt.code
                                    return (
                                        <DataTableCell
                                            key={opt.code}
                                            align="center"
                                            backgroundColor={rowBackground}
                                            className={styles.inputCell}
                                        >
                                            <SelectControl
                                                dense
                                                className={styles.input}
                                                name={fieldId}
                                                checked={checked}
                                                onChange={() =>
                                                    handleChange(
                                                        fieldId,
                                                        opt.code
                                                    )
                                                }
                                            />
                                        </DataTableCell>
                                    )
                                })}
                            </DataTableRow>
                        )
                    })}
                </DataTableBody>
            </DataTable>
            {tooltip && <Tooltip {...tooltip} />}
        </div>
    )
}

export default Plugin
