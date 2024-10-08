import { useEffect, useRef, useState } from "react"
import './NoteTitle.css'
import { Keyboard } from "@capacitor/keyboard"

const NoteTitle = ({ title, update } : {title: string, update: (title: string) => void}) => {

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(title)

    Keyboard.addListener('keyboardWillHide', () => {
      if(document.activeElement === inputRef.current!) {
        inputRef.current!.blur()
      }
    })
  }, [])

  useEffect(() => {
    if(isEditing) {
      inputRef.current?.focus()
      inputRef.current!.selectionStart = content ? content.length : (title ? title.length : 0);
    }
  }, [isEditing])

  return (
    <>
      {
        isEditing
        ? <textarea
          ref={inputRef}
          className="notetitle-editor-input"
          value={content}
          // @ts-expect-error: ignore next line for now
          enterkeyhint="done"
          onChange={(e) => {
            setContent(e.target.value)
            if(e.target.value.length < content.length) {
              inputRef.current!.style.height = "auto"
              if(Math.ceil(inputRef.current!.scrollHeight / 19.2) > 1) {
                inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
              } else {
                inputRef.current!.style.height = "32px"
              }
            } else {
              inputRef.current!.style.height = "auto"
              inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
            }
          }}
          onKeyDown={(e) => {
            if (e.key == 'Escape') {
              inputRef.current?.blur()
            } else if (e.key == 'Enter') {
              update(content)
              inputRef.current?.blur()
            }
          }}
          onFocus={(e) => {
            inputRef.current!.style.height = "auto"
            inputRef.current!.style.overflowY = "hidden"
            inputRef.current!.rows = 1
            if(Math.ceil(inputRef.current!.scrollHeight / 19.2) > 1) {
              inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
            } else {
              inputRef.current!.style.height = "32px"
            }
          }}
          onBlur={(e) => {
            update(content)
            setIsEditing(false)
          }}
        >{title ?? ""}</textarea>
        : <>
          {
            title
            ? <p style={{margin: 0, padding: '8px 16px 0', textAlign: 'center', fontWeight: 500, color: 'var(--ion-color-medium)'}} onClick={() => {setIsEditing(true)}}>{title}</p>
            : <p style={{margin: 0, padding: '8px 16px 0', textAlign: 'center', fontWeight: 500, color: 'var(--ion-color-medium)'}} onClick={() => {setIsEditing(true)}}>Tap to set title</p>
          }
       </>
      }
    </>
  )
}

export default NoteTitle