import { IonIcon, IonItem, IonLabel } from "@ionic/react"
import { documentTextOutline, documentTextSharp } from "ionicons/icons"

import '../../notesList.css'

const NoteItem: React.FC = (props) => {

  const { note } = props

  return (
    <IonItem className="noteListItem" routerLink={"/notes/details/" + note._id}>
      <div className="icon-wrapper" slot="start">
        <IonIcon slot="start" color="medium" icon={documentTextSharp}></IonIcon>
      </div>
      <IonLabel>{note.title}</IonLabel>
    </IonItem>
  )
}

export default NoteItem