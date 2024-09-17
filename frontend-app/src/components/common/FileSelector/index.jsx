import { ReactElement } from "react";
import FileCard from '../FileCard';
import Arrow from "../../ui/Arrow";
import './styles.css';

/**
* @param {object} props
* @param {object} props.fileManager
* @param {object} props.sliderManager
* @param {Function} props.onChange
* @returns {ReactElement}
*/
export default function FileSelector({ fileManager, sliderManager, onChange }) {
  const { files } = fileManager;
  const { slide, setSlide, pagination } = sliderManager;

  const handleChange = (newPage) => {
    if (
      newPage !== pagination.page
      && newPage >= 1
      && newPage <= pagination.totalPages
    ) onChange("page", newPage);
  };

  const renderPage = () => `${pagination.page} of ${pagination.totalPages}`;

  return (
    <section className="iss__fileSelector">
      <div className='iss__fileSelector__inner'>
        {
          files.map(({id, file_name, upload_date, status, author_name, rebound}, index) => (
            <FileCard
              key={id}
              cardIndex={index}
              name={file_name}
              author_name={author_name}
              date={upload_date}
              status={rebound ? "r" : status }
              active={slide === index}
              handleCLick={(index) => setSlide(index)}
            />
          ))
        }
      </div>
      {
        pagination &&
        <div className="iss__fileSelector__pagination">
          <Arrow
            size={16}
            point="left"
            onClick={() => handleChange(pagination.page - 1)}
            classes={[pagination.page <= 1 ? "nav--block" : ""]}
          />
          <div className="iss_fileSelector__pagination__input">
            {/* <input
              type="number"
              defaultValue={pagination.page}
              onBlur={({target}) => handleChange(target.value)}
              min={1}
              max={pagination.totalPages}
              onKeyDown={({ target, key }) => key === "Enter" && handleChange(target.value)}
              disabled={pagination.totalPages <= 1}
            /> */}
            { renderPage() }
          </div>
          <Arrow
            size={16}
            point="right"
            onClick={() => handleChange(pagination.page + 1)}
            classes={[pagination.page >= pagination.totalPages ? "nav--block" : ""]}
          />
        </div>
      }
    </section>
  );
}
