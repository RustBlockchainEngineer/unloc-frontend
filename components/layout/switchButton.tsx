import React from 'react'
interface SwitchButtonInterface {
    state: boolean
    onClick: (state: boolean) => void
}

export const SwitchButton = ({
    state,
    onClick
}: SwitchButtonInterface) => {

    return (
        <div className={`switch--button`} onClick={() => { onClick(!state) }}>
            <div className={`switch--button--knob ${state ? 'left' : 'right'}`}></div>
        </div>
    )
}
