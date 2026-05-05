import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../domain/order/order.entity';
import { OrderId } from '../../../domain/order/value-objects/order-id.vo';
import { OrderRepository } from '../../../domain/order/order.repository';
import { OrderOrmEntity } from '../entities/order.orm-entity';
import { OrderMapper } from '../mappers/order.mapper';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly ormRepository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<void> {
    const ormEntity = OrderMapper.toOrm(order);
    const exists = await this.ormRepository.existsBy({ id: ormEntity.id });
    if (exists) {
      await this.ormRepository.update(
        { id: ormEntity.id },
        { status: ormEntity.status, updatedAt: ormEntity.updatedAt },
      );
    } else {
      await this.ormRepository.save(ormEntity);
    }
  }

  async findById(id: OrderId): Promise<Order | null> {
    const ormEntity = await this.ormRepository.findOne({
      where: { id: id.value },
      relations: ['items'],
    });
    return ormEntity ? OrderMapper.toDomain(ormEntity) : null;
  }

  async findAll(): Promise<Order[]> {
    const ormEntities = await this.ormRepository.find({
      relations: ['items'],
    });
    return ormEntities.map(OrderMapper.toDomain);
  }
}
