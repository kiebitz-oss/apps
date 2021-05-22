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

// The local backend
export default class LocalBackend {

    constructor(settings, store){
        this.settings = settings
        this.store = store
    }

    store(key, data){
        // the tracing data contains only "public" information shown to
        // location operators, so we store it locally
        return new Promise((resolve, reject) =>{
            // the traces are just stored as JSON objects
            this.store.set(key, JSON.stringify(data))
            resolve()
        })
    }

    get(key){
        
    }

    // simulates the background tasks that the normal local backend would do
    backgroundTasks(){

    }
}
