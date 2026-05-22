import { createPortal } from 'react-dom'
import React from 'react'

export interface TooltipState {
    text: string
    x: number
    y: number
}

export const Tooltip = ({ text, x, y }: TooltipState) =>
    createPortal(
        <div
            style={{
                position: 'fixed',
                left: x,
                top: y,
                transform: 'translateX(-50%)',
                background: '#fff',
                color: 'rgba(0,0,0,0.87)',
                border: '1px solid #e0e0e0',
                padding: '6px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                lineHeight: '1.3',
                whiteSpace: 'normal',
                maxWidth: '280px',
                width: 'max-content',
                zIndex: 9999,
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                pointerEvents: 'none',
            }}
        >
            {text}
        </div>,
        document.body
    )
