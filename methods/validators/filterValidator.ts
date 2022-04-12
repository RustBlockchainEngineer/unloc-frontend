export const validateFilterInput = (value: string, names: string): boolean => {
    if (value != undefined) {
        return true
    } else {
        return false
    }
}

export const validateFilterInputMin = (value:number, min: Number): boolean => {
    if (value != undefined && value >= min) {
        return true
    } else {
        return false
    }
}

export const validateFilterInputMax = (value:number, max: number): boolean => {
    if (value != undefined && value <= max) {
        return true
    } else {
        return false
    }
}