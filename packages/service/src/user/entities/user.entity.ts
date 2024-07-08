import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Role} from "./role.entity";


@Entity({
    name: 'lin_users'
})
export class User {
    @PrimaryGeneratedColumn()
    uid: number

    @Column({
        length: 50,
        comment: '用户名'
    })
    username: string;

    @Column({
        length: 50,
        comment: '密码'
    })
    password: string;

    @Column({
        name: 'nick_name',
        length: 50,
        comment: '昵称'
    })
    nickName: string;


    @Column({
        comment: '邮箱',
        length: 50
    })
    email: string;


    @Column({
        name: 'head_pic',
        comment: '头像',
        length: 100,
        nullable: true
    })
    headPic: string;

    @Column({
        name: 'phone_number',
        comment: '手机号',
        length: 20,
        nullable: true
    })
    phoneNumber: string;

    @Column({
        name: 'is_frozen',
        comment: '是否冻结',
        default: false
    })
    isFrozen: boolean;

    @Column({
        name: 'is_admin',
        comment: '是否是管理员',
        default: false
    })
    isAdmin: boolean;

    @CreateDateColumn({name: 'create_time'})
    createTime: Date;

    @UpdateDateColumn({name: 'update_time'})
    updateTime: Date;

    @ManyToMany(() => Role)
    @JoinTable({
        name: 'lin_user_roles'
    })
    roles: Role[]
}