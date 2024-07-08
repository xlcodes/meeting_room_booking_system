import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity({
    name: 'lin_permissions'
})
export class Permission {
    @PrimaryGeneratedColumn()
    pid: number;

    @Column({
        length: 20,
        comment: '权限代码'
    })
    code: string

    @Column({
        length: 100,
        comment: '权限名称'
    })
    desc: string
}