import { IonIcon, IonItem, IonLabel, IonRippleEffect, useIonModal, useIonRouter } from "@ionic/react";
import { checkmarkCircle, chevronForwardCircleOutline, ellipseOutline, pauseCircleOutline, removeCircle } from "ionicons/icons";
import StatusPickerModal from "./StatusPickerModal";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import PouchDB from "pouchdb"
import PouchFind from "pouchdb-find"

const TaskItem: React.FC<TaskItemProps> = (props) => {

  const db = new PouchDB('duet');

  const { task, updateFn, project } = props

  const router = useIonRouter()

  const icons = {
    "Todo": {
      icon: ellipseOutline,
      color: "medium"
    },
    "Next": {
      icon: chevronForwardCircleOutline,
      color: "primary"
    },
    "Waiting": {
      icon: pauseCircleOutline,
      color: "medium"
    },
    "Done": {
      icon: checkmarkCircle,
      color: "success"
    },
    "Cancelled": {
      icon: removeCircle,
      color: "medium"
    },
  }

  const [present, dismiss] = useIonModal(StatusPickerModal, {
    dismiss: (data: string, role: string) => dismiss(data, role),
  });

  function openModal(id: string) {
    present({
      cssClass: 'statusPickerModal',
      onWillDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
        if (ev.detail.role === 'confirm') {
          updateTaskStatus(id, ev.detail.data)
        }
      },
    });
  }

  const updateTaskStatus = async (id: string, status: string) => {
    const timestamp = new Date().toISOString()
    
    db.get(id).then(task => {
      db.put({
        ...task,
        status: status || 'Todo',
        timestamps: {
          ...task.timestamps,
          updated: timestamp,
          completed: status == 'Done' ? timestamp : null
        }
      }).then(response => {
        if(response.ok) {
          updateFn()
        }
      })
    })
  }
  
  return (
    <IonItem className="task-item" key={task._id} button onClick={() => {router.push("/tasks/" + task._id)}}>
      <div slot="start" className="status-wrapper ion-activatable" onClick={(e) => {openModal(task._id); e.stopPropagation()}}>
        <IonRippleEffect type="unbounded"></IonRippleEffect>
        <IonIcon icon={icons[task.status].icon} onClick={() => {}} color={icons[task.status].color}></IonIcon>
      </div>
      <IonLabel
        style={{textDecoration: task.status == "Done" ? 'line-through' : 'none'}}
        color={task.status == "Done" ? 'medium' : 'initial'}
      >
        {task.title}
        {
          project
          ? <p>{project.title}</p>
          : null
        }
      </IonLabel>
    </IonItem>
  )
}

export default TaskItem