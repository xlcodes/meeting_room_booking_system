import * as crypto from 'crypto'

export const md5 = (str: string) => crypto.createHash('md5').update(str).digest('hex')

export const isTrue = (value: unknown) => {
    if(typeof value === 'string') {
        return value.toLowerCase() === 'true'
    }

    return !!value
}