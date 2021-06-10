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

const process = require('process');
const path = require('path');

Task = function(options) {
  let m_self = this;
  let m_name = options.name;
  let m_type = options.type;
  let m_action = options.action;
  let m_prereqs = options.prereqs;
  let m_module = options.module;
  let m_namespace = options.namespace;
  let m_namespaceDelimiter = options.namespaceDelimiter;

  this.runAction = function(callback) {
    let hasAction = typeof m_action == 'function';
    if (hasAction) {
      process.chdir(path.dirname(m_module.getNjsmFileAbsPath()));
      try {
        let result = m_action.apply(m_self, [m_self]);
        let asyncAction = (typeof result == 'object') && (typeof result.then == 'function');
        if (asyncAction) {
          result.then((result) => {
            callback(null, result);
          }, (error) => {
            callback(error);
          });        
        } else {
          callback(null, result);
        }
      } catch(error) {
        callback(error);
      }
    } else {
      callback(null);
    }
  }

  this.getName = function() {
    return m_name;
  }

  this.getFullName = function() {
    if (m_namespace) {
      return m_namespace.getFullName() + m_namespaceDelimiter + m_name;
    }
    return m_name;
  }

  this.getType = function() {
    return m_type;
  }

  this.getNamespace = function() {
    return m_namespace;
  }

  this.getPrereqs = function() {
    return m_prereqs;
  }

  this.getModule = function() {
    return m_module;
  }

};

module.exports.Task = Task;
