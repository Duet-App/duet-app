import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { documentTextOutline } from "ionicons/icons"

import '../../notesList.css'

const NoteItem: React.FC = (props) => {

  const { note } = props

  return (
    <IonItem className="noteListItem" routerLink={"/notes/details/" + note._id}>
      <div className="icon-wrapper" slot="start">
        <IonIcon slot="start" icon={documentTextOutline}></IonIcon>
      </div>
      <IonLabel>{note.title}</IonLabel>
    </IonItem>
  )
}

export default NoteItem