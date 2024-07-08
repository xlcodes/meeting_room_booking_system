import {Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable} from 'typeorm'
import {Permission} from './permission.entity'

@Entity({
    name: 'lin_roles'
})
export class Role {
    @PrimaryGeneratedColumn()
    rid: number

    @Column({
        length: 20,
        comment: '角色名'
    })
    name: string

    @ManyToMany(() => Permission)
    @JoinTable({
        name: 'lin_roles_permissions',
    })
    permissions: Permission[]
}