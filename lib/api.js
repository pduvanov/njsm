/*
 * NJSM JavaScript build tool
 * Copyright 2021 Pavel Duvanov
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

Api = function(model) {
  let m_model = model;

  this.include = function(filePath) {
    m_model.loadNjsmFile(filePath);
  };

  this.namespace = function(name, closure) {
    m_model.includeNamespaceContent(name, closure);
  }

  this.task = function(name, prereqs, action, options) {
    let params = {
      name: name,
      type: 'task',
      prereqs: null,
      action: null,
      options: {}
    };

    let args = Array.prototype.slice.call(arguments);
    params.name = args.shift();

    if (args.length && Array.isArray(args[0])) {
      params.prereqs = args.shift();
    }

    if (args.length && typeof args[0] == 'function') {
      params.action = args.shift();
    }

    if (args.length && typeof args[0] == 'object') {
      params.options = Object.assign(Object.create(null), args.shift());
    }

    let task = m_model.createTask(params.name, params.type, params.prereqs, params.action, params.options);
  }

  this.file = function(name, prereqs, action, options) {
    let params = {
      name: name,
      type: 'file',
      prereqs: null,
      action: null,
      options: {}
    };

    let args = Array.prototype.slice.call(arguments);
    params.name = args.shift();

    if (args.length && Array.isArray(args[0])) {
      params.prereqs = args.shift();
    }

    if (args.length && typeof args[0] == 'function') {
      params.action = args.shift();
    }

    if (args.length && typeof args[0] == 'object') {
      params.options = Object.assign(Object.create(null), args.shift());
    }

    let task = m_model.createTask(params.name, params.type, params.prereqs, params.action, params.options);
  }

  this.fail = function(error) {
    if (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error.toString());  
      }
    } else {
      throw new Error();
    }
  };

};

module.exports.Api = Api;