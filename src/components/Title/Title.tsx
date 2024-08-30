import { useEffect, useRef, useState } from "react"
import './Title.css'

const Title = ({ title, update } : {title: string, update: (title: string) => void}) => {

  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(title)
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
          className="title-editor-input"
          value={content}
          // @ts-expect-error: ignore next line for now
          enterkeyhint="done"
          onChange={(e) => {
            setContent(e.target.value)
            if(e.target.value.length < content.length) {
              inputRef.current!.style.height = "auto"
              if(Math.ceil(inputRef.current!.scrollHeight / 26.4) > 1) {
                inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
              } else {
                inputRef.current!.style.height = "26.4px"
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
            if(Math.ceil(inputRef.current!.scrollHeight / 26.4) > 1) {
              inputRef.current!.style.height = inputRef.current!.scrollHeight + "px"
            } else {
              inputRef.current!.style.height = "26.4px"
            }
          }}
          onBlur={(e) => {
            setIsEditing(false)
          }}
        >{title ?? ""}</textarea>
        : <>
          {
            title
            ? <h3 style={{marginTop: 0}} onClick={() => {setIsEditing(true)}}>{title}</h3>
            : <h3 style={{marginTop: 0, color: 'var(--ion-color-medium)'}} onClick={() => {setIsEditing(true)}}>Tap to set title</h3>
          }
       </>
      }
    </>
  )
}

export default Title