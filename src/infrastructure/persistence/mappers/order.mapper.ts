import { Order } from '../../../domain/order/order.entity';
import { OrderItem } from '../../../domain/order/order-item.entity';
import { OrderId } from '../../../domain/order/value-objects/order-id.vo';
import { OrderStatus } from '../../../domain/order/value-objects/order-status.vo';
import { Money } from '../../../domain/order/value-objects/money.vo';
import { OrderOrmEntity } from '../entities/order.orm-entity';
import { OrderItemOrmEntity } from '../entities/order-item.orm-entity';

export class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order {
    const items = (orm.items ?? []).map((item) =>
      OrderItem.reconstitute(
        item.id,
        item.productId,
        item.name,
        Number(item.price),
        item.quantity,
      ),
    );
    return Order.reconstitute(
      OrderId.from(orm.id),
      orm.customerId,
      OrderStatus.from(orm.status),
      items,
      Money.of(Number(orm.total)),
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: Order): OrderOrmEntity {
    const ormEntity = new OrderOrmEntity();
    ormEntity.id = domain.id.value;
    ormEntity.customerId = domain.customerId;
    ormEntity.status = domain.status.value;
    ormEntity.total = domain.total.value;
    ormEntity.createdAt = domain.createdAt;
    ormEntity.updatedAt = domain.updatedAt;

    ormEntity.items = domain.items.map((item) => {
      const ormItem = new OrderItemOrmEntity();
      ormItem.id = item.id;
      ormItem.productId = item.productId;
      ormItem.name = item.name;
      ormItem.price = item.price.value;
      ormItem.quantity = item.quantity;
      ormItem.order = ormEntity;
      return ormItem;
    });

    return ormEntity;
  }
}
