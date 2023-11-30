package com.gritlab.buy01.orderservice.model;

import java.sql.Date;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.gritlab.buy01.orderservice.dto.ProductDTO;
import com.gritlab.buy01.orderservice.model.enums.OrderStatus;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Document(collection = "orders")
@Data
public class Order {
  @Id private String id;

  private String sellerId;

  private String buyerId;

  private ProductDTO product;

  private OrderStatus status;

  private Date orderPlacedAt;

  public Order(String sellerId, String buyerId, ProductDTO product) {
    this.sellerId = sellerId;
    this.buyerId = buyerId;
    this.product = product;

    this.status = OrderStatus.PENDING;
  }
}
