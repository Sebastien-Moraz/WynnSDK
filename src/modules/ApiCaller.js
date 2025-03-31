import fetch from 'node-fetch';


export default class ApiCaller {
	static instance = null;
	static allowConstruction = false;
	static getInstance() {
		if (this.instance === null) {
			this.allowConstruction = true;
			this.instance = new ApiCaller();
		}
		return this.instance;
	}
	
	constructor() {
		if (!ApiCaller.allowConstruction) {
			throw new Error('This class is a singleton and cannot be instantiated directly.');
		}
		ApiCaller.allowConstruction = false;
		this.url = 'https://api.wynncraft.com/v3';
		this.headers = {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'User-Agent': 'WynnSDK/0.1.1'
		};
		this.cache = new Map();
	}

	async request(url, options = {}) {
		if (this.cache.has(url)) {
			const cached = this.cache.get(url);
			if (cached.expires > Date.now()) {
				return cached.data;
			} else {
				this.cache.delete(url);
			}
		}
		
		const response = await fetch(url, {
			method: 'GET',
			headers: this.headers
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.status} ${response.statusText}: ${(await response.json())["Error"]}`);
		}

		const data = await response.json();
		let cacheTime = 0;
		if (options.cacheTime) {
			cacheTime = options.cacheTime;
		} else {
			cacheTime = response.headers.get('cache-control');
			let age = response.headers.get('Age');
			if (cacheTime) {
				cacheTime = parseInt(cacheTime.split('=')[1]);
				if (age) {
					cacheTime -= parseInt(age);
				}
			} else {
				cacheTime = 0;
			}
		}
		if (cacheTime > 0) {
			this.cache.set(url, {
				data: data,
				expires: Date.now() + cacheTime * 1000
			});
		}

		return data;
	}
		
}