import FileCard from '../FileCard';
import './styles.css';

export default function FileSelector({ fileManager, sliderManager }) {
  const { files } = fileManager;
  const { slide, setSlide } = sliderManager;

  return (
    <div className='iss__fileSelector'>
      {
        files.map(({id, file_name, upload_date, status, author_name}, index) => (
          <FileCard
            key={id}
            cardIndex={index}
            name={file_name}
            author_name={author_name}
            date={upload_date}
            status={status}
            active={slide === index}
            handleCLick={(index) => setSlide(index)}
          />
        ))
      }
    </div>
  );
}
