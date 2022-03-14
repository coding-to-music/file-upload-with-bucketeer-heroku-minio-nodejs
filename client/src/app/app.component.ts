import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { HttpClient } from '@angular/common/http';
import { dataURItoFile } from './utils/dataURI-to-file';
import { Observable, Subscription } from 'rxjs';
import { Image, ListResponse } from './utils/image';

const apiURL = '/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  imageChangedEvent: unknown = '';
  croppedImage: string | null | undefined = '';
  imageURL: string = '';
  imageTitle: string;
  images: Image[] = [];
  addImageSubscription$: Subscription;
  getPresignedURLSubscription$: Subscription;
  uploadImageSubscription$: Subscription;
  listImagesSubscription$: Subscription;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.triggerListImages();
  }

  fileChangeEvent(event: unknown): void {
    this.imageChangedEvent = event;
  }

  async imageCropped(event: ImageCroppedEvent): Promise<Subscription | void> {
    this.croppedImage = event.base64;
    if (!!this.croppedImage) {
      return await this.prepareImage(this.croppedImage);
    }
  }

  submitImage(): void {
    this.addImageSubscription$ = this.addImage().subscribe();
    this.croppedImage = '';
    this.triggerListImages();
  }

  private getPresignedUrl(fileType: string): Observable<{ uploadURL: string }> {
    const params = {
      fileType,
    };
    return this.http.get<{ uploadURL: string }>(`${apiURL}/image-get-url`, {
      params,
    });
  }

  private uploadImage(file: File): void {
    this.uploadImageSubscription$ = this.http
      .put<void>(this.imageURL, file, {
        headers: { 'Cache-Control': 'max-age=0' },
      })
      .subscribe();
  }

  private async prepareImage(croppedImage: string): Promise<void> {
    const imageData = await dataURItoFile(croppedImage);
    this.getPresignedURLSubscription$ = this.getPresignedUrl(
      encodeURIComponent(imageData.mimeType)
    ).subscribe((presignedURL) => {
      this.imageURL = presignedURL.uploadURL;
      this.uploadImage(imageData.file);
    });
  }

  private addImage(): Observable<void> {
    const imageBody = {
      title: this.imageTitle,
      imageURL: this.imageURL,
    };
    return this.http.post<void>(`${apiURL}/image-add`, { ...imageBody });
  }

  private listImages(): Observable<ListResponse<Image>> {
    return this.http.get<ListResponse<Image>>(
      `${apiURL}/images?skip=0&limit=100`
    );
  }

  private triggerListImages(): void {
    this.listImagesSubscription$ = this.listImages().subscribe(
      (images) => (this.images = images.items)
    );
  }

  ngOnDestroy(): void {
    this.addImageSubscription$.unsubscribe();
    this.listImagesSubscription$.unsubscribe();
    this.uploadImageSubscription$.unsubscribe();
    this.getPresignedURLSubscription$.unsubscribe();
  }
}
