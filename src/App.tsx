import { useState } from 'react'
import logoCapacitaT from './assets/logo-capacita-t.png'
import logoCapacitaHeader from './assets/logo-capacita-header.png'
import './index.css'

type View =
  | 'home'
  | 'employee'
  | 'training'
  | 'evaluation'
  | 'finished'
  | 'admin'
  | 'new-training'

const employees = [
  { name: 'Juan Pérez', status: 'Completada', date: '26/09/2026 18:42', score: '8/10' },
  { name: 'María López', status: 'Pendiente', date: '—', score: '—' },
  { name: 'Pedro Díaz', status: 'Completada', date: '27/09/2026 09:31', score: '9/10' },
  { name: 'Luciano Gómez', status: 'Completada', date: '27/09/2026 12:15', score: '10/10' },
  { name: 'Carlos Fernández', status: 'Pendiente', date: '—', score: '—' },
  { name: 'Martín Rodríguez', status: 'Completada', date: '28/09/2026 07:54', score: '7/10' },
  { name: 'Nicolás Sánchez', status: 'Pendiente', date: '—', score: '—' },
  { name: 'Diego Martínez', status: 'Completada', date: '28/09/2026 16:20', score: '9/10' },
  { name: 'Federico Suárez', status: 'Completada', date: '29/09/2026 10:03', score: '8/10' },
  { name: 'Matías Torres', status: 'Pendiente', date: '—', score: '—' },
]

function App() {
  const [view, setView] = useState<View>('home')
  const [question, setQuestion] = useState(0)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const questions = [
    '¿Cuál es el primer paso antes de comenzar una tarea?',
    '¿Cuándo deben utilizarse los elementos de protección personal?',
    '¿Qué debe hacerse si se detecta una condición insegura?',
    '¿Quién es responsable de cumplir las normas de seguridad?',
    '¿Qué debe verificarse antes de utilizar una herramienta?',
  ]

  const goHome = () => {
    setView('home')
    setQuestion(0)
  }

  const goBackEmployee = () => {
    if (view === 'employee') {
      setView('home')
    } else if (view === 'training') {
      setView('employee')
    } else if (view === 'evaluation') {
      setView('training')
    } else if (view === 'finished') {
      setView('home')
    }
  }

  return (
    <div className="app">

      <header className="header">
        <button
          className="brand brand-logo"
          onClick={goHome}
          aria-label="Capacita-T - Ir al inicio"
        >
          <img
            src={logoCapacitaHeader}
            alt="Capacita-T"
            className="header-logo"
          />
        </button>

        <span className="demo-badge">DEMO</span>
      </header>

      <main>

        {view === 'home' && (
          <>
            <section className="hero">
              <div className="hero-content">
                <span className="eyebrow">CAPACITACIÓN EMPRESARIAL ONLINE</span>

                <h1>
                  Capacitar a tu equipo,
                  <span> ahora es más simple.</span>
                </h1>

                <p>
                  Tus empleados pueden realizar capacitaciones y evaluaciones
                  desde cualquier lugar. Vos tenés toda la información organizada
                  y disponible en un solo lugar.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary"
                    onClick={() => setView('employee')}
                  >
                    Probar como empleado
                  </button>

                  <button
                    className="secondary"
                    onClick={() => setView('admin')}
                  >
                    Ver panel administrador
                  </button>
                </div>

                <div className="hero-features">
                  <div className="hero-feature">
                    <span className="feature-icon">▶</span>
                    <strong>Video</strong>
                  </div>

                  <span className="feature-dot">•</span>

                  <div className="hero-feature">
                    <span className="feature-icon">▤</span>
                    <strong>Evaluación</strong>
                  </div>

                  <span className="feature-dot">•</span>

                  <div className="hero-feature">
                    <span className="feature-icon">▥</span>
                    <strong>Seguimiento</strong>
                  </div>

                  <span className="feature-dot">•</span>

                  <div className="hero-feature">
                    <span className="feature-icon">★</span>
                    <strong>Resultados</strong>
                  </div>
                </div>
              </div>

              <div className="hero-visual logo-visual">
                <img
                  src={logoCapacitaT}
                  alt="Capacita-T - Formación que construye futuro"
                  className="capacita-logo"
                />
              </div>
            </section>

            <section className="how-it-works">
              <div className="section-heading">
                <span className="eyebrow">TODO EN UN SOLO LUGAR</span>
                <h2>Del contenido al seguimiento.</h2>
                <p>
                  Una forma simple de capacitar equipos sin importar dónde estén.
                </p>
              </div>

              <div className="steps">
                <article>
                  <div className="step-number">01</div>
                  <div className="step-icon">▶</div>
                  <h3>Capacitá</h3>
                  <p>
                    Compartí contenidos y videos para que cada empleado
                    pueda capacitarse desde donde esté.
                  </p>
                </article>

                <article>
                  <div className="step-number">02</div>
                  <div className="step-icon">✓</div>
                  <h3>Evaluá</h3>
                  <p>
                    Creá evaluaciones multiple choice asociadas
                    a cada capacitación.
                  </p>
                </article>

                <article>
                  <div className="step-number">03</div>
                  <div className="step-icon">◎</div>
                  <h3>Registrá</h3>
                  <p>
                    Guardá automáticamente quién realizó cada capacitación,
                    cuándo y qué respondió.
                  </p>
                </article>

                <article>
                  <div className="step-number">04</div>
                  <div className="step-icon">▥</div>
                  <h3>Controlá</h3>
                  <p>
                    Consultá pendientes, resultados y respuestas
                    desde un panel centralizado.
                  </p>
                </article>
              </div>
            </section>

            <section className="commercial-cta">
              <div>
                <span className="cta-tag">CAPACITA-T PARA EMPRESAS</span>

                <h2>
                  ¿Querés simplificar las capacitaciones de tu equipo?
                </h2>

                <p>
                  Adaptamos Capacita-T a las necesidades de tu empresa.
                  Consultanos y te contamos cómo implementarlo.
                </p>
              </div>

              <a
                className="whatsapp-button"
                href="https://wa.me/542983419423?text=Hola%2C%20vi%20el%20demo%20de%20Capacita-T%20y%20me%20gustar%C3%ADa%20recibir%20m%C3%A1s%20informaci%C3%B3n."
                target="_blank"
                rel="noreferrer"
              >
                <span className="whatsapp-icon">●</span>
                Quiero Capacita-T para mi empresa
              </a>
            </section>
          </>
        )}
        {view === 'employee' && (
          <section className="page">
            <div className="employee-page-header">
              <span className="eyebrow">PORTAL DEL EMPLEADO</span>

              <button
                className="back-button"
                onClick={goBackEmployee}
              >
                <span>←</span>
                Volver al inicio
              </button>
            </div>

            <h2>Hola, Juan 👋</h2>
            <p>Tenés una capacitación pendiente.</p>

            <div className="training-card">
              <div className="training-icon">🦺</div>

              <div className="training-info">
                <span className="status pending">Pendiente</span>

                <h3>Uso correcto de elementos de protección personal</h3>

                <p>
                  Capacitación introductoria sobre utilización,
                  mantenimiento y control de EPP.
                </p>

                <div className="meta">
                  <span>🎥 18 minutos</span>
                  <span>📝 5 preguntas</span>
                </div>

                <div className="availability">
                  <strong>Período disponible</strong>
                  <span>25/09/2026 - 08:00</span>
                  <span>hasta 30/09/2026 - 23:59</span>
                </div>

                <button
                  className="primary"
                  onClick={() => setView('training')}
                >
                  Comenzar capacitación
                </button>
              </div>
            </div>
          </section>
        )}

        {view === 'training' && (
          <section className="page narrow">
            <div className="employee-page-header">
              <span className="eyebrow">PASO 1 DE 2</span>

              <button
                className="back-button"
                onClick={goBackEmployee}
              >
                <span>←</span>
                Volver a mis capacitaciones
              </button>
            </div>

            <h2>Uso correcto de EPP</h2>

            <p>
              Mirá el video completo antes de realizar la evaluación.
            </p>

            <div className="video-demo">
              <div className="play">▶</div>
              <span>Video de capacitación</span>
              <small>Demo · 18 minutos</small>
            </div>

            <div className="notice">
              ✓ Para este demo podés continuar directamente a la evaluación.
            </div>

            <button
              className="primary full"
              onClick={() => setView('evaluation')}
            >
              Ir a la evaluación
            </button>
          </section>
        )}

        {view === 'evaluation' && (
          <section className="page narrow">
            <div className="employee-page-header">
              <span className="eyebrow">PASO 2 DE 2 · EVALUACIÓN</span>

              <button
                className="back-button"
                onClick={goBackEmployee}
              >
                <span>←</span>
                Volver a la capacitación
              </button>
            </div>

            <span className="question-number">
              Pregunta {question + 1} de {questions.length}
            </span>

            <h2 className="question">
              {questions[question]}
            </h2>

            <div className="answers">
              {[
                'Antes de iniciar la tarea',
                'Solamente si lo solicita un supervisor',
                'Cuando ocurre un accidente',
                'Al finalizar la jornada'
              ].map((answer, index) => (
                <label className="answer" key={index}>
                  <input
                    type="radio"
                    name={`question-${question}`}
                  />
                  <span>{answer}</span>
                </label>
              ))}
            </div>

            <button
              className="primary full"
              onClick={() => {
                if (question < questions.length - 1) {
                  setQuestion(question + 1)
                } else {
                  setView('finished')
                }
              }}
            >
              {question < questions.length - 1
                ? 'Siguiente pregunta'
                : 'Enviar evaluación'}
            </button>
          </section>
        )}

        {view === 'finished' && (
          <section className="page narrow centered">
            <div className="success">✓</div>

            <h2>Evaluación enviada</h2>

            <p>
              Gracias, Juan. Tu participación quedó registrada correctamente.
            </p>

            <div className="result-card">
              <span>Capacitación realizada</span>
              <strong>29/09/2026 · 18:42</strong>
            </div>

            <button className="secondary" onClick={goHome}>
              Volver al inicio
            </button>
          </section>
        )}

        {view === 'admin' && (
          <section className="dashboard">

            <div className="dashboard-title">
              <div>
                <span className="eyebrow">PANEL ADMINISTRADOR</span>
                <h2>Resumen de capacitación</h2>
              </div>

              <div className="admin-actions">
                <button
                  className="primary"
                  onClick={() => setView('new-training')}
                >
                  + Nueva capacitación
                </button>

                <button
                  className="secondary"
                  onClick={goHome}
                >
                  Salir del panel
                </button>
              </div>
            </div>

            <div className="stats">
              <article>
                <span>Empleados</span>
                <strong>10</strong>
              </article>

              <article>
                <span>Completaron</span>
                <strong>6</strong>
              </article>

              <article>
                <span>Pendientes</span>
                <strong>4</strong>
              </article>

              <article>
                <span>Promedio</span>
                <strong>8.5</strong>
              </article>
            </div>

            <div className="admin-training">
              <div>
                <span className="status active">ACTIVA</span>
                <h3>Uso correcto de elementos de protección personal</h3>
              </div>

              <div className="dates">
                <span>📅 Apertura: 25/09/2026 · 08:00</span>
                <span>🔒 Cierre: 30/09/2026 · 23:59</span>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Resultado</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.name}>
                      <td><strong>{employee.name}</strong></td>

                      <td>
                        <span
                          className={
                            employee.status === 'Completada'
                              ? 'status completed'
                              : 'status pending'
                          }
                        >
                          {employee.status}
                        </span>
                      </td>

                      <td>{employee.date}</td>
                      <td>{employee.score}</td>

                      <td>
                        {employee.status === 'Completada' && (
                          <button
                            className="link-button"
                            onClick={() => setSelectedEmployee(employee.name)}
                          >
                            Ver respuestas
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedEmployee && (
              <div
                className="modal-overlay"
                onClick={() => setSelectedEmployee(null)}
              >
                <div
                  className="modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="modal-header">
                    <div>
                      <span className="eyebrow">DETALLE DE EVALUACIÓN</span>
                      <h2>{selectedEmployee}</h2>
                    </div>

                    <button
                      className="modal-close"
                      onClick={() => setSelectedEmployee(null)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="evaluation-summary">
                    <div>
                      <span>Capacitación</span>
                      <strong>Uso correcto de EPP</strong>
                    </div>

                    <div>
                      <span>Resultado</span>
                      <strong>8/10</strong>
                    </div>

                    <div>
                      <span>Fecha</span>
                      <strong>26/09/2026 · 18:42</strong>
                    </div>
                  </div>

                  <div className="response-list">

                    <div className="response correct-response">
                      <div className="response-top">
                        <strong>Pregunta 1</strong>
                        <span>✓ Correcta</span>
                      </div>

                      <p>
                        ¿Cuál es el primer paso antes de comenzar una tarea?
                      </p>

                      <small>Respuesta del empleado</small>
                      <strong>Antes de iniciar la tarea.</strong>
                    </div>

                    <div className="response correct-response">
                      <div className="response-top">
                        <strong>Pregunta 2</strong>
                        <span>✓ Correcta</span>
                      </div>

                      <p>
                        ¿Cuándo deben utilizarse los elementos de protección personal?
                      </p>

                      <small>Respuesta del empleado</small>
                      <strong>
                        Siempre que la tarea y los riesgos identificados lo requieran.
                      </strong>
                    </div>

                    <div className="response incorrect-response">
                      <div className="response-top">
                        <strong>Pregunta 3</strong>
                        <span>✕ Incorrecta</span>
                      </div>

                      <p>
                        ¿Qué debe hacerse si se detecta una condición insegura?
                      </p>

                      <small>Respuesta del empleado</small>
                      <strong>Continuar trabajando con precaución.</strong>

                      <small className="correct-label">
                        Respuesta correcta
                      </small>

                      <strong>
                        Detener la tarea y comunicar la situación.
                      </strong>
                    </div>

                    <div className="response correct-response">
                      <div className="response-top">
                        <strong>Pregunta 4</strong>
                        <span>✓ Correcta</span>
                      </div>

                      <p>
                        ¿Quién es responsable de cumplir las normas de seguridad?
                      </p>

                      <small>Respuesta del empleado</small>
                      <strong>
                        Todas las personas involucradas en el trabajo.
                      </strong>
                    </div>

                    <div className="response correct-response">
                      <div className="response-top">
                        <strong>Pregunta 5</strong>
                        <span>✓ Correcta</span>
                      </div>

                      <p>
                        ¿Qué debe verificarse antes de utilizar una herramienta?
                      </p>

                      <small>Respuesta del empleado</small>
                      <strong>
                        Que se encuentre en condiciones seguras de uso.
                      </strong>
                    </div>

                  </div>
                </div>
              </div>
            )}

          </section>
        )}

        {view === 'new-training' && (
          <section className="page new-training-page">

            <div className="new-training-header">
              <div>
                <span className="eyebrow">PANEL ADMINISTRADOR</span>
                <h2>Nueva capacitación</h2>
                <p>
                  Configurá el contenido, período disponible y evaluación.
                </p>
              </div>

              <button
                className="secondary"
                onClick={() => setView('admin')}
              >
                ← Volver al panel
              </button>
            </div>

            <div className="form-card">

              <div className="form-section">
                <div className="section-number">1</div>

                <div className="section-content">
                  <h3>Información general</h3>
                  <p>Datos principales de la capacitación.</p>

                  <label>
                    Título de la capacitación
                    <input
                      type="text"
                      placeholder="Ej: Uso correcto de elementos de protección personal"
                    />
                  </label>

                  <label>
                    Descripción
                    <textarea
                      rows={4}
                      placeholder="Breve descripción de la capacitación..."
                    />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="section-number">2</div>

                <div className="section-content">
                  <h3>Video de capacitación</h3>
                  <p>
                    Agregá el material que deberán visualizar los empleados.
                  </p>

                  <label>
                    URL del video
                    <input
                      type="url"
                      placeholder="https://..."
                    />
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="section-number">3</div>

                <div className="section-content">
                  <h3>Período disponible</h3>
                  <p>
                    Definí cuándo podrán realizarla los empleados.
                  </p>

                  <div className="form-grid">
                    <label>
                      Fecha y hora de apertura
                      <input type="datetime-local" />
                    </label>

                    <label>
                      Fecha y hora de cierre
                      <input type="datetime-local" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-number">4</div>

                <div className="section-content">
                  <h3>Evaluación</h3>

                  <p>
                    Creá las preguntas que deberán responder después del video.
                  </p>

                  <div className="demo-question">
                    <div className="demo-question-header">
                      <strong>Pregunta 1</strong>
                      <span>Multiple choice</span>
                    </div>

                    <input
                      type="text"
                      placeholder="Escribí la pregunta..."
                    />

                    <div className="option-input">
                      <input type="radio" name="correct-demo" />
                      <input
                        type="text"
                        placeholder="Opción A"
                      />
                    </div>

                    <div className="option-input">
                      <input type="radio" name="correct-demo" />
                      <input
                        type="text"
                        placeholder="Opción B"
                      />
                    </div>

                    <div className="option-input">
                      <input type="radio" name="correct-demo" />
                      <input
                        type="text"
                        placeholder="Opción C"
                      />
                    </div>

                    <small>
                      Seleccioná el círculo correspondiente a la respuesta correcta.
                    </small>
                  </div>

                  <button className="add-question">
                    + Agregar otra pregunta
                  </button>
                </div>
              </div>

              <div className="form-section">
                <div className="section-number">5</div>

                <div className="section-content">
                  <h3>Asignar empleados</h3>

                  <p>
                    Seleccioná quiénes deberán realizar esta capacitación.
                  </p>

                  <div className="employee-selection">
                    {employees.map((employee) => (
                      <label key={employee.name}>
                        <input
                          type="checkbox"
                          defaultChecked
                        />
                        <span>{employee.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-footer">
                <span>
                  ℹ️ Esta función es demostrativa.
                </span>

                <button
                  className="primary"
                  onClick={() => setView('admin')}
                >
                  Publicar capacitación
                </button>
              </div>

            </div>

          </section>
        )}

      </main>

      <footer>
        <div className="footer-brand">
          <strong>Capacita-T</strong>
          <span>Formación que construye futuro</span>
        </div>

        <span className="footer-divider"></span>

        <small className="footer-credit">
          Una solución desarrollada por
          <a
            href="https://dcweb-dev.com.ar/"
            target="_blank"
            rel="noreferrer"
            className="dcweb-link"
            aria-label="Visitar DC Web"
          >
            <span className="dc-icon">&lt;/&gt;</span>

            <span className="dc-name">
              DC <b>Web</b>
            </span>

            <span className="dc-arrow">↗</span>
          </a>
        </small>
      </footer>

    </div>
  )
}

export default App