import './Footer.scss';

export const Footer = () => {
    const instagramUrl = 'https://instagram.com/juanmacar15';

    return (
        <footer className="footer">
            <div className="container footer__container">
                <div className="footer__content">
                    <div className="footer__info">
                        <span>Creado por Juanmacar</span>
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer__link"
                        >
                            <img
                                src="/perfil.jpg"
                                alt="Juanmacar"
                                className="footer__avatar"
                            />
                        </a>
                    </div>
                    <div className="footer__copyright">
                        &copy; {new Date().getFullYear()} Barber Revolution - Todos los derechos reservados
                    </div>
                </div>
            </div>
        </footer>
    );
};