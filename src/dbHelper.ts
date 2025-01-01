export const projects_progress_ddoc = {
  "_id": "_design/projects-progress-ddoc",
  views: {
    "project-progress": {
      map: function mapFun(doc) {
        if(doc.type == "task" && doc.project_id) {
          emit(doc.project_id, {type: "task", status: doc.status});
        }
      }.toString(),
      reduce: function redFun(keys, values, rereduce) {
        if (rereduce) {
          return values;
        } else {
          var total = 0;
          var complete = 0;
          for(var i = 0; i < values.length; i++) {
            if(values[i].type == "task") {
              if(values[i].status == "Done" || values[i].status == "Cancelled") {
                complete = complete + 1;
              }
              total = total + 1;
            }
          }
          return {total: total, complete: complete};
        }
      }.toString()
    }
  }
}

export const projects_ddoc = {
  "_id": "_design/projects-ddoc",
  views: {
    "project-tasks": {
      map: function mapFun(doc) {
        if(doc.type == "project" && doc.tasks) {
          for(var i in doc.tasks) {
            emit([doc._id, Number(i)+1], {_id: doc.tasks[i]})
          }
        }
      }.toString()
    },
    "project-notes": {
      map: function mapFun(doc) {
        if(doc.type == "project" && doc.notes) {
          for(var i in doc.notes) {
            emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
          }
        }
      }.toString()
    },
    "project-progress": {
      map: function mapFun(doc) {
        if(doc.type == "task" && doc.project_id) {
          emit(doc.project_id, {type: "task", status: doc.status});
        }
      }.toString(),
      reduce: function redFun(keys, values, rereduce) {
        if (rereduce) {
          return values;
        } else {
          var total = 0;
          var complete = 0;
          for(var i = 0; i < values.length; i++) {
            if(values[i].type == "task") {
              if(values[i].status == "Done" || values[i].status == "Cancelled") {
                complete = complete + 1;
              }
              total = total + 1;
            }
          }
          return {total: total, complete: complete};
        }
      }.toString()
    }
  }
}

export const projects_notes_ddoc = {
  "_id": "_design/projects-notes-ddoc",
  views: {
    "project-notes": {
      map: function mapFun(doc) {
        if(doc.type == "project" && doc.notes) {
          for(var i in doc.notes) {
            emit([doc._id, Number(i)+1], {_id: doc.notes[i]})
          }
        }
      }.toString()
    },
  }
}