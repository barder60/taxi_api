const mongoose = require('mongoose');
class Core {
    // -------------------------
    // We take a list of models in param and if necessary
    // apply populate on it to render correctly
    // -------------------------
    static render(list, options = {}) {
        const isAlone = !Array.isArray(list);
        // if we only have one elem we put it into an array to avoid error
        if (isAlone) list = [list];
        return (
            Promise.resolve()
                .then(() => {
                    // We check if we have to render only few fields
                    if (options.fields) {
                        // if the fields si on One string like this : 'name price products' we split it
                        if (typeof options.fields === 'string')
                            options.fields = options.fields.split(' ');
                        // we sort each non fields string
                        list = list.map(model => {
                            return this.filterFields(model.toObject(), options.fields)
                        })
                    }
                    // if options contain populate we populate the Data
                    if (options.populates) {
                        return this.getModel().populate(list, options.populates)
                    }
                    return list;
                })
                .then(renderedList => (isAlone ? renderedList.pop() : renderedList))
        )
    }
    // -------------------------
    // Start a find on documents
    // -------------------------
    static find(search, options = {}) {
        return (
            Promise.resolve()
                // we avoid value: ['', null, 'null', undefined]
                .then(() => this.cleanModelData(search))
                .then(s =>
                    this.getModel()
                        .find(s)
                        .sort(options.order || 'created_at')
                        .exec()
                )
        );
    }

    // -------------------------
    // Update a document by his ID
    // -------------------------
    static update(id, data, options = {}) {
        return (
            Promise.resolve()
                // We check only fields authorizedFields
                .then(() => this.filterFields(data, options.authorizedFields))
                .then(filteredData =>
                    Promise.all([
                        // we avoid value: ['', null, 'null', undefined]
                        this.cleanModelData(filteredData),
                        // We get the document
                        typeof id === 'object'
                            ? this.getModel()
                                .findOne(id)
                                .exec()
                            : this.getModel()
                                .findById(id)
                                .exec(),
                    ])
                )
                .then(([model, checkedData]) => {
                    if (!model)
                        throw new Error(
                            `Unknow ${this.prototype.modelName} document ID ${id}`
                        );
                    // If no data modify them return the model
                    if (!Object.keys(checkedData).length) return model;
                    // We set the new data into the model
                    model.set(checkedData);
                    // Marks the path as having pending changes to write to the db
                    Object.keys(checkedData).forEach(key => model.markModified(key));
                    // We save the document
                    return model.save();
                })
        )
    }

    // -------------------------
    // Return the render of a documents
    // id can be a document or an ID
    // -------------------------
    static read(id, options = {}, getEnough) {
        return Promise.resolve()
            .then(() =>
                {
                    if(getEnough){
                        return id
                    }
                    // Only read One document
                    return typeof id === 'object'
                        ? this.getModel().findOne(id).exec()
                        : this.getModel().findById(id).exec()
                }
            )
            .then((model) => {
                return this.render(model, options)
            })
    }

    // -------------------------
    // Create a new document in collections
    // -------------------------
    static create(data, options = {}) {
        if (Array.isArray(data)) return this.createMany(data, options);
        return (
            Promise.resolve()
                // We avoid non authorizedFields
                .then(() => this.filterFields(data, options.authorizedFields))
                // we avoid value: ['', null, 'null', undefined]
                .then(filteredData => this.cleanModelData(filteredData))
                // We create the new document
                .then(checkedData => this.getModel().create(checkedData))
        )
    }

    static eliminateDuplicates(arr) {
        let i, len=arr.length, out=[], obj={};

        for (i=0;i<len;i++) {
            obj[arr[i]]=0;
        }
        for (i in obj) {
            out.push(i);
        }
        return out;
    }

    // -------------------------
    // Create a lot of new documents in collections
    // -------------------------
    static createMany(list, options = {}) {
        return (
            Promise.resolve()
                // We avoid non authorizedFields
                .then(() =>
                    list.map(m => this.filterFields(m, options.authorizedFields))
                )
                // we avoid value: ['', null, 'null', undefined]
                .then(filteredList => filteredList.map(this.cleanModelData.bind(this)))
                // We create the new document
                .then(checkedList => this.getModel().insertMany(checkedList))
        );
    }
    // -------------------------
    // Clean data pass in param by removing
    // example: {key: xxx, value: null}
    // -------------------------
    static cleanModelData(data) {
        const result = {};
        const emptyValues = ['', null, 'null', undefined];
        Object.keys(data).forEach(key => {
            // We avoid null value to render
            if (emptyValues.includes(data[key])) return;
            // We save the data into the result Array
            result[key] = data[key];
        });

        return result;
    }
    // -------------------------
    // Use a filter that as been declare in the object with authorizedFields
    // and only save data that's in it
    // -------------------------
    static filterFields(data, fields) {
        if (!fields) return data;
        // We create the filtered Element
        let filteredFields = {};
        // We only save fields value
        fields.forEach(key => {
            if (data[key] !== undefined) filteredFields[key] = data[key];
        });
        return filteredFields;
    }
    // -------------------------
    // Return the model from mongoose with a string that's as been load in memory of mongoose
    // -------------------------
    static getModel() {
        return mongoose.model(this.prototype.modelName);
    }

    static contains(arr, key, val) {
        for (let i = 0; i < arr.length; i++) {
            if(arr[i][key] == val) return true;
        }
        return false;
    }
    static containsRestaurant(arr, key, val) {
        for (let i = 0; i < arr.length; i++) {
            if(arr[i]['restaurant'] && arr[i]['restaurant'][key] == val) return true;
        }
        return false;
    }
}

// Model Name of the controller
Core.prototype.modelName = 'Default';
module.exports = Core;
