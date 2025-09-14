import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { ValidRoles } from "../../auth/enums/valid-roles.enum";

@Entity({ name: 'users' })
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 100, name: 'avatar_url', nullable: true })
    avatarUrl?: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    email: string;

    // Keep property name `password` in the entity for compatibility with existing logic,
    // but map to `password_hash` column in the database.
    @Column({ type: 'varchar', name: 'password_hash' })
    password: string;

    @Column({ type: 'enum', enum: ValidRoles, default: ValidRoles.user })
    roles: ValidRoles;

    @Column({ type: 'boolean', name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
    deletedAt?: Date | null;

}
