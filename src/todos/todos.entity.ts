import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export default class Todo {
  @PrimaryColumn({ nullable: false, unique: true })
  public id: string;

  @Column({ nullable: false })
  public title: string;

  @Column()
  public completed: boolean;

  @Column()
  public order: number;
}
