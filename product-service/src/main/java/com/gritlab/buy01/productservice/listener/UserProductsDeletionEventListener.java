package com.gritlab.buy01.productservice.listener;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import com.gritlab.buy01.productservice.event.UserProductsDeletionEvent;
import com.gritlab.buy01.productservice.service.ProductService;

@Component
public class UserProductsDeletionEventListener {

  @Autowired private ProductService productService;

  @EventListener
  public void handleUserProductsDeletionEvent(UserProductsDeletionEvent event) {
    productService.deleteAllUserProducts(event.getUserId());
  }
}
