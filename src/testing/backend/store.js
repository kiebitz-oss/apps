// Kiebitz - Privacy-Friendly Appointments
// Copyright (C) 2021-2021 The Kiebitz Authors
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

export class PrefixStore {
	constructor(store, prefix){
		this.store = store
		this.prefix = prefix
	}

	set(key, data){
		return this.store.set(`${this.prefix}::${key}`, data)
	}

	get(key){
		return this.store.get(`${this.prefix}::${key}`)
	}

	remove(key){
		return this.store.remove(`${this.prefix}::${key}`)		
	}
}

export class StorageStore {
	constructor(storage){
		this.storage = storage
	}

	set(key, data){
		this.storage.setItem(key, JSON.stringify(data))
	}

	get(key){
		const data = this.storage.getItem(key)
		if (data !== null)
			return JSON.parse(data)
		return data
	}

	remove(key){
		this.storage.removeItem(key)
	}
}

export class LocalStorageStore extends StorageStore {
	constructor(){
		super(localStorage)
	}
}

export class SessionStorageStore extends StorageStore {
	constructor(){
		super(sessionStorage)
	}
}