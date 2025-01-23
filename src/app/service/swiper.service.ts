import { Injectable } from '@angular/core';

declare const initialSwiper: any;

@Injectable({
	providedIn: 'root',
})
export class SwiperService {
	constructor() {}

	createSwiper(selector: string, config: {}) {
		initialSwiper(selector, config, "", "", {}, "");
	}

	createThumbnail(selector: string, thumb: string, config: {}, configThumb: {}, classActive: string) {
		initialSwiper(selector, config, thumb, "THUMBNAIL", configThumb, classActive);
	}
}
