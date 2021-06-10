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

Namespace = function(options) {
  let m_namespaces = new Map(); 
  let m_delimiter = options.delimiter;
  let m_parentName = options.parentName;
  let m_name = options.name;
  let m_tasks = new Map();

  this.openNamespace = function(name) {
    if (m_namespaces.has(name)) {
      return m_namespaces.get(name);
    } else {
      let namespace = new Namespace({
        name: name,
        delimiter: m_delimiter,
        parentName: this.getFullName(),
      });
      m_namespaces.set(name, namespace);
      return namespace;
    }
  }

  this.registerTask = function(task) {
    if (!m_tasks.has(task.getName())) {
      m_tasks.set(task.getName(), task);
    } else {
      throw new Error('Task [' + task.getName() + '] already exists in namespace [' + this.getFullName() + ']');
    }
  };

  this.resolveTask = function(taskName) {
    let names = taskName.split(m_delimiter);

    if (names.length == 1) {
      return this.findTask(taskName);
    } else {
      let namespaceName = names[0];
      if (m_namespaces.has(namespaceName)) {
        let namespace = m_namespaces.get(namespaceName);
        names.shift();
        return namespace.findTask(names.join(m_delimiter));
      }//  TODO write else: new Error('Namespace not found');
    }

    return null;
  }

  this.resolveNamespace = function(namespaceName) {
    let names = namespaceName.split(m_delimiter);

    if (m_namespaces.has(names[0])) {
      let namespace = m_namespaces.get(names[0]);
      if (names.length == 1) {
        return namespace;
      } else {
        names.shift();
        return namespace.resolveNamespace(names.join(m_delimiter));
      }
    } 

    return null;
  }

  this.findTask = function(name) {
    if (m_tasks.has(name)) {
      return m_tasks.get(name);
    } else 
    return null;
  }

  this.getFullName = function() {
    if (m_parentName) {
      return m_parentName + m_delimiter + m_name;
    }
    return m_name;
  };

  this.getName = function() {
    return m_name;
  };
  
};

module.exports.Namespace = Namespace;
