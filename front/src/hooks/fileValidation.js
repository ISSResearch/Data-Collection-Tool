import { useState } from "react";

export default function useFiles() {
  const [files, setFiles] = useState([]);


  return { files, setFiles }
}