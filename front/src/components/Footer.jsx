import '../styles/components/footer.css'

export default function Footer() {
  return (
    <footer className="iss__footer">
      <ul className="iss__footer__contacts">
        <li className="iss__footer__contact">
          <span>made in:</span>
          <a href="/">ISS</a>
        </li>
        <li className='iss__footer__contact'>
          <span>phone:</span>
          <a href="tel:000000000">000-000-00-00</a>
        </li>
      </ul>
    </footer>
  );
}