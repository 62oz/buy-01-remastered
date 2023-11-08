import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { Product } from 'src/app/interfaces/product';
import { ProductRequest } from 'src/app/interfaces/product-request';
import { User } from 'src/app/interfaces/user';
// import { AuthService } from 'src/app/service/auth.service';
import { DataService } from 'src/app/service/data.service';
import { FormStateService } from 'src/app/service/form-state.service';
import { MediaService } from 'src/app/service/media.service';
import { ProductService } from 'src/app/service/product.service';
import { StateService } from 'src/app/service/state.service';
import { UserService } from 'src/app/service/user.service';
import { ValidatorService } from 'src/app/service/validator.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-product-card-modal',
  templateUrl: './product-card-modal.component.html',
  styleUrls: ['./product-card-modal.component.css'],
})
export class ProductCardModalComponent implements OnInit {
  @ViewChild('tabGroup')
    tabGroup!: MatTabGroup;
  @ViewChild('productModal')
    productModal?: ElementRef;
  @ViewChild('imageUpload')
    imageUploadButton: FileUpload | undefined;
  @Input()
    dialog?: HTMLDialogElement;
  @Input()
    product!: Product;
  @Input()
    user?: User;

  price = 0;
  quantity = 0;
  currentImageIndex = 0;
  currentDeleteIndex = 0;
  formOpen = false;
  formValid = true;
  success = false;
  confirm = false;
  requestSent = false;
  imageValid = false;
  imageDeleteConfirm = false;
  deletingProduct = false;
  productResult: string = '';
  errorMessage: string = '';
  filename: string = '';
  images: string[] = [];
  imageIds: string[] = [];
  placeholder: string = environment.placeholder;
  picture: string = this.placeholder;
  fileSelected: File | null = null;
  owner: User = {} as User;
  currentUser: User = {} as User;

  private productService = inject(ProductService);
  private mediaService = inject(MediaService);
  private formStateService = inject(FormStateService);
  private userService = inject(UserService);
  private validatorService = inject(ValidatorService);
  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  // private authService = inject(AuthService);
  private stateService = inject(StateService);

  productForm: FormGroup = new FormGroup({
    name: new FormControl(null, [this.validatorService.productNameValidator()]),
    description: new FormControl(null, [
      this.validatorService.productDescriptionValidator(),
    ]),
    price: new FormControl(null, [
      this.validatorService.productPriceValidator(),
    ]),
    quantity: new FormControl(null, [
      this.validatorService.productQuantityValidator(),
    ]),
  });

  ngOnInit(): void {
    this.initFormValues();

    this.stateService.state.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (user) => this.user = user,
    );

    this.mediaService.getProductThumbnail(
      this.product.id!,
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((media) => {
      if (media) {
        this.picture = this.mediaService.formatMedia(media);
      }
    });

    this.dataService.deleteImage$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        this.currentDeleteIndex = index;
      });

    this.dataService.ids$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (id) => {
        if (id !== this.product.id) return;
        // this.getProductImages();
        // this.getProductOwnerInfo();
        // this.mediaService.getProductThumbnail(this.product.id);
      },
    );
  }

  getProductOwnerInfo() {
    this.userService.getOwnerInfo(
      this.product.userId!,
    ).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => this.owner = user,
        // error: (err) => console.log(err),
      });
  }

  getProductImages() {
    this.mediaService
      .getProductMedia(this.product.id!).pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          if (data && data.media && data.media.length > 0) {
            this.imageIds = [];
            this.images = data.media.map((item) => {
              this.imageIds.push(item.id);
              return this.mediaService.formatMultipleMedia(item);
            });
          }
        },
        // error: () => of(null),
      });
  }

  openImageInNewTab(imageData: string): void {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(
        `<img src="${imageData}" alt="product image" />`,
      );
    }
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
    this.dataService.changeDeleteIndex(this.currentImageIndex);
  }

  prevImage() {
    this.currentImageIndex = Math.max(
      (this.currentImageIndex - 1) % this.images.length,
      0,
    );
    this.dataService.changeDeleteIndex(this.currentImageIndex);
  }

  deleteImage(index: number) {
    if (this.imageIds.length === 1) index = 0;
    const id = this.imageIds[index];
    this.mediaService.deleteProductImage(id);
    this.currentImageIndex--;
    this.dataService.sendProductId(this.product.id!);
    this.tabGroup.selectedIndex = 0;
    if (this.currentImageIndex < 0) this.currentImageIndex = 0;
    if (this.images.length === 0) this.picture = this.placeholder;
    this.images.splice(index, 1);
    this.imageIds.splice(index, 1);
    //INFO: this might not work, to refresh the images & products
    // this.productService.updateProductAdded(this.product);
    this.closeConfirm('image');
  }

  initFormValues() {
    this.productForm.get('price')?.setValue(this.product.price);
    this.productForm.get('quantity')?.setValue(this.product.quantity);
    this.productForm.get('name')?.setValue(this.product.name);
    this.productForm.get('description')?.setValue(this.product.description);
  }

  hideModal() {
    if (!this.deletingProduct) {
      this.formStateService.setFormOpen(false);
      this.dialog?.close();
      this.closeConfirm('product');
    }
  }

  onValidate() {
    this.formValid = this.productForm.valid;
  }

  fileToBlob(file: File): Blob {
    const blob = new Blob([file], { type: file.type });
    return blob;
  }

  onFileSelected(event: FileSelectEvent) {
    const input = event.files[0];
    if (input) {
      this.filename = input.name;
      this.fileSelected = input;
      this.imageValid = true;
    } else {
      this.fileSelected = null;
      this.imageValid = false;
    }
  }

  updateProduct() {
    console.log(this.product.id);
    if (this.formValid) {
      const prod = {
        name: this.productForm.value.name,
        description: this.productForm.value.description,
        price: this.productForm.value.price,
        quantity: this.productForm.value.quantity,
      } as Product;
      this.productService.updateProduct(this.product.id!, prod).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (data) => {
          this.productService.updateProductAdded(data!);
        },
      });
    }
  }

  submitProduct() {
    let mediaData;
    if (this.fileSelected) {
      mediaData = new FormData();
      mediaData.append(
        'image',
        this.fileToBlob(this.fileSelected),
        this.filename as string,
      );
    } else {
      mediaData = null;
    }

    let productRequest: ProductRequest;
    if (this.formValid) {
      productRequest = {
        name: this.productForm.value.name,
        description: this.productForm.value.description,
        price: this.productForm.value.price,
        quantity: this.productForm.value.quantity,
      } as ProductRequest;
      this.productService.addProduct(productRequest, mediaData).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: (data: Product | null) => {
          this.success = data !== null;
          this.requestSent = true;
          this.productResult = 'Product added successfully';
          this.productService.updateProductAdded(data!);
        },
        error: () => {
          this.success = false;
          this.productResult = 'Error adding product';
        },
      });
    }
    this.productForm.reset();
    this.imageUploadButton?.clear();
    this.tabGroup.selectedIndex = 0;
  }

  submitImage() {
    if (!this.fileSelected) return;
    const mediaForm = new FormData();
    mediaForm.append(
      'image',
      this.fileToBlob(this.fileSelected),
      this.filename,
    );
    this.mediaService.addMedia(
      this.product.id!,
      mediaForm,
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data) => {
        this.images.push(this.mediaService.formatMultipleMedia(data));
        this.fileSelected = null;
        this.filename = '';
        this.dataService.sendProductId(this.product.id!);
        this.getProductImages();
      },
      error: (err) => this.errorMessage = err.error.message,
    });
    this.tabGroup.selectedIndex = 0;
    this.dataService.sendProductId(this.product.id!);
  }

  deleteProduct(productId: string, isDeletingProduct: boolean = false): void {
    if (isDeletingProduct) {
      // this.hideModal();
      // this.dialog?.close();
    } else {
      this.deletingProduct = true;
      this.productService.deleteProduct(productId);
      this.dialog?.close();
      this.formStateService.setFormOpen(false);
      //INFO: this might cause issues, try to update the products, to remove the deleted one from the list
      this.productService.updateProductAdded({} as Product);
    }
  }

  openConfirm(form: string) {
    if (form === 'product') {
      this.confirm = true;
    } else this.imageDeleteConfirm = true;
  }

  closeConfirm(tag: string) {
    if (tag == 'image') {
      this.imageDeleteConfirm = false;
    } else {
      this.confirm = false;
    }
  }
}
