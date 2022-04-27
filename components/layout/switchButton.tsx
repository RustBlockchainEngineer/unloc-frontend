import React from 'react'
interface SwitchButtonInterface {
    state: boolean
    onClick: (state: boolean) => void
    classNames?: string
}

export const SwitchButton = ({
    state,
    onClick,
    classNames
}: SwitchButtonInterface) => {

    return (
        <div className={`switch--button ${classNames}`} onClick={() => { onClick(!state) }}>
            <div className={`switch--button--knob ${state ? 'left' : 'right'}`}></div>
        </div>
    )
}
