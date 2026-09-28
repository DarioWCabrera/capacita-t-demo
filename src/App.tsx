import { useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import logoCapacitaT from './assets/logo-capacita-t.png'
import logoCapacitaHeader from './assets/logo-capacita-header.png'
import plantelLogo from './assets/plantel-logo.jpg';
import './index.css'

type View =
  | 'home'
  | 'employee'
  | 'training'
  | 'evaluation'
  | 'signature'
  | 'finished'
  | 'admin'
  | 'new-training'
  | 'login'

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
  const [view, setView] = useState<View>(() => {
    const loggedOut = sessionStorage.getItem('capacita_logged_out');

    return loggedOut === 'true' ? 'login' : 'home';
  });
  const [question, setQuestion] = useState(0)
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const isDrawingRef = useRef(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [savedSignature, setSavedSignature] = useState<string | null>(null)
  const [signedAt, setSignedAt] = useState<string>('')
  const [certificateId, setCertificateId] = useState<string>('')

  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code' | 'password'>('email')
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [newTrainingTitle, setNewTrainingTitle] = useState('');
  const [newTrainingDescription, setNewTrainingDescription] = useState('');
  const [newTrainingSource, setNewTrainingSource] = useState('');
  const [newTrainingMaterialTitle, setNewTrainingMaterialTitle] = useState('');
  const [newTrainingMaterialUrl, setNewTrainingMaterialUrl] = useState('');

  const [newTrainingQuestions, setNewTrainingQuestions] = useState([
    {
      text: '',
      options: ['', '', ''],
      correctAnswer: 0,
    },
  ]);

  const [authenticatedUser, setAuthenticatedUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('capacita_user');

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  const getCanvasPoint = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current

    if (!canvas) {
      return { x: 0, y: 0 }
    }

    const rect = canvas.getBoundingClientRect()

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const startSignature = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    event.preventDefault()

    const context = canvas.getContext('2d')
    if (!context) return

    const { x, y } = getCanvasPoint(event)

    isDrawingRef.current = true
    canvas.setPointerCapture(event.pointerId)

    context.beginPath()
    context.moveTo(x, y)
  }

  const drawSignature = (
    event: React.PointerEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawingRef.current) return

    const canvas = signatureCanvasRef.current
    if (!canvas) return

    event.preventDefault()

    const context = canvas.getContext('2d')
    if (!context) return

    const { x, y } = getCanvasPoint(event)

    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#14213d'

    context.lineTo(x, y)
    context.stroke()

    setHasSignature(true)
  }

  const stopSignature = (
    event?: React.PointerEvent<HTMLCanvasElement>
  ) => {
    isDrawingRef.current = false

    if (
      event &&
      signatureCanvasRef.current?.hasPointerCapture(event.pointerId)
    ) {
      signatureCanvasRef.current.releasePointerCapture(event.pointerId)
    }
  }

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const confirmSignature = () => {
    const canvas = signatureCanvasRef.current

    if (!canvas || !hasSignature) return

    const signatureImage = canvas.toDataURL('image/png')

    const now = new Date()

    const generatedCertificateId = `CAP-${now
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${now
        .getTime()
        .toString()
        .slice(-6)}`

    setCertificateId(generatedCertificateId)

    const formattedDate = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(now)

    setSavedSignature(signatureImage)
    setSignedAt(formattedDate)
    setView('finished')
  }

  const downloadCertificate = () => {
    if (!savedSignature) return

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()

    // Encabezado
    doc.setFillColor(15, 43, 75)
    doc.rect(0, 0, pageWidth, 35, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(22)
    doc.text('Capacita-T', 20, 18)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text('Formación que construye futuro', 20, 25)

    // Título
    doc.setTextColor(16, 42, 67)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('CONSTANCIA DE REALIZACIÓN', 20, 52)

    doc.setFontSize(17)
    doc.text(
      'Uso correcto de elementos de protección personal',
      20,
      63
    )

    doc.setDrawColor(220, 227, 235)
    doc.line(20, 74, 190, 74)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)

    doc.text(
      `Constancia Nro. ${certificateId}`,
      20,
      68
    )

    // Datos
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.text('EMPLEADO', 20, 84)

    doc.setTextColor(16, 42, 67)
    doc.setFontSize(12)
    doc.text('Juan Pérez', 20, 92)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('DNI 32.456.789', 20, 99)

    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('FECHA Y HORA', 110, 84)

    doc.setTextColor(16, 42, 67)
    doc.setFontSize(11)
    doc.text(signedAt || '-', 110, 92)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.text('EVALUACIÓN', 20, 114)

    doc.setTextColor(16, 42, 67)
    doc.setFontSize(11)
    doc.text('Completada', 20, 122)

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.text('RESULTADO', 110, 114)

    doc.setTextColor(16, 42, 67)
    doc.setFontSize(11)
    doc.text('8/10', 110, 122)

    // Declaración
    doc.setFillColor(239, 248, 255)
    doc.roundedRect(20, 135, 170, 32, 3, 3, 'F')

    doc.setTextColor(52, 64, 84)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    const declaration =
      'El empleado declara haber realizado la capacitación "Uso correcto de EPP" y haber completado personalmente la evaluación correspondiente.'

    const declarationLines = doc.splitTextToSize(
      declaration,
      155
    )

    doc.text(declarationLines, 28, 147)

    // Firma
    doc.setTextColor(100, 116, 139)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('FIRMA REGISTRADA', 20, 184)

    doc.addImage(
      savedSignature,
      'PNG',
      65,
      190,
      80,
      35
    )

    doc.setDrawColor(148, 163, 184)
    doc.line(60, 229, 150, 229)

    doc.setTextColor(16, 42, 67)
    doc.setFontSize(11)
    doc.text(
      'Juan Pérez',
      pageWidth / 2,
      236,
      { align: 'center' }
    )

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.text(
      'Firma del empleado',
      pageWidth / 2,
      242,
      { align: 'center' }
    )

    // Pie
    doc.setDrawColor(220, 227, 235)
    doc.line(20, 263, 190, 263)

    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      'Registro generado por Capacita-T',
      20,
      272
    )

    doc.text(
      'Formación que construye futuro',
      190,
      272,
      { align: 'right' }
    )

    doc.save(
      `constancia-${certificateId}-juan-perez.pdf`
    )
  }

  const questions = [
    {
      text: '¿Cuál es la función principal de los elementos de protección personal (EPP)?',
      options: [
        'Reducir la exposición del trabajador a determinados riesgos',
        'Reemplazar todas las medidas de prevención',
        'Evitar la necesidad de capacitación',
      ],
      correctAnswer: 0,
    },
    {
      text: '¿Cuándo deben utilizarse los elementos de protección personal?',
      options: [
        'Únicamente después de que ocurra un accidente',
        'Cuando la tarea y los riesgos presentes requieran su utilización',
        'Solamente cuando lo solicite un compañero',
      ],
      correctAnswer: 1,
    },
    {
      text: '¿Qué debe hacerse si un elemento de protección personal está deteriorado?',
      options: [
        'Continuar utilizándolo hasta finalizar la jornada',
        'Guardarlo y utilizar otro sin informar',
        'Informar la situación y solicitar su reemplazo',
      ],
      correctAnswer: 2,
    },
    {
      text: '¿Qué debe verificarse antes de utilizar un EPP?',
      options: [
        'Que se encuentre en condiciones adecuadas para su utilización',
        'Únicamente que tenga el color correspondiente',
        'Que haya sido utilizado anteriormente por otro trabajador',
      ],
      correctAnswer: 0,
    },
    {
      text: '¿Quién debe colaborar con el cuidado de los elementos de protección personal?',
      options: [
        'Únicamente el responsable de Seguridad e Higiene',
        'El trabajador que los utiliza',
        'Solamente el proveedor de los elementos',
      ],
      correctAnswer: 1,
    },
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

  const updateTrainingQuestion = (
    questionIndex: number,
    text: string,
  ) => {
    setNewTrainingQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? { ...question, text }
          : question
      )
    );
  };

  const updateTrainingOption = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setNewTrainingQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = [...question.options];
        updatedOptions[optionIndex] = value;

        return {
          ...question,
          options: updatedOptions,
        };
      })
    );
  };

  const addTrainingOption = (questionIndex: number) => {
    setNewTrainingQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex
          ? {
            ...question,
            options: [...question.options, ''],
          }
          : question
      )
    );
  };

  const removeTrainingOption = (
    questionIndex: number,
    optionIndex: number,
  ) => {
    setNewTrainingQuestions((currentQuestions) =>
      currentQuestions.map((question, index) => {
        if (index !== questionIndex) {
          return question;
        }

        const updatedOptions = question.options.filter(
          (_, index) => index !== optionIndex
        );

        let updatedCorrectAnswer = question.correctAnswer;

        if (optionIndex === question.correctAnswer) {
          updatedCorrectAnswer = 0;
        } else if (optionIndex < question.correctAnswer) {
          updatedCorrectAnswer = question.correctAnswer - 1;
        }

        return {
          ...question,
          options: updatedOptions,
          correctAnswer: updatedCorrectAnswer,
        };
      })
    );
  };

  const addTrainingQuestion = () => {
    setNewTrainingQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        text: '',
        options: ['', '', ''],
        correctAnswer: 0,
      },
    ]);
  };

  const removeTrainingQuestion = (questionIndex: number) => {
    setNewTrainingQuestions((currentQuestions) =>
      currentQuestions.filter((_, index) => index !== questionIndex)
    );
  };

  const createTrainingFromLibrary = (
    title: string,
    description: string,
    source: string,
    materialTitle: string,
    materialUrl: string,
  ) => {
    setNewTrainingTitle(title);
    setNewTrainingDescription(description);
    setNewTrainingSource(source);
    setNewTrainingMaterialTitle(materialTitle);
    setNewTrainingMaterialUrl(materialUrl);
    setView('new-training');
  };

  const shareTrainingByWhatsApp = () => {
    const trainingUrl = 'https://capacita-t.dcweb-dev.com.ar/';

    const message = `Hola. Plantel te asignó una nueva capacitación:

📚 Uso correcto de elementos de protección personal

Ingresá al siguiente enlace para realizarla:
${trainingUrl}

Capacita-T · Formación que construye futuro`;

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  const downloadPrintableTraining = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    let y = 20;

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Capacita-T', margin, y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Formación que construye futuro', margin, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PLANTEL', pageWidth - margin, y, { align: 'right' });

    y += 20;

    doc.setDrawColor(210);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('REGISTRO DE CAPACITACIÓN PRESENCIAL', margin, y);

    y += 10;

    doc.setFontSize(12);
    doc.text(
      'Uso correcto de elementos de protección personal',
      margin,
      y,
    );

    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    const description =
      'Capacitación sobre selección, utilización, cuidado y control de los elementos de protección personal durante las tareas laborales.';

    const descriptionLines = doc.splitTextToSize(
      description,
      pageWidth - margin * 2,
    );

    doc.text(descriptionLines, margin, y);
    y += descriptionLines.length * 5 + 8;

    // Datos del trabajador
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL TRABAJADOR', margin, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.text('Nombre y apellido: __________________________________________', margin, y);
    y += 8;
    doc.text('DNI: ______________________', margin, y);
    y += 8;
    doc.text('Sector / Puesto: ___________________________________________', margin, y);
    y += 8;
    doc.text('Fecha de capacitación: ____ / ____ / ______', margin, y);

    y += 14;

    // Evaluación
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('EVALUACIÓN', margin, y);

    y += 8;

    questions.forEach((item, questionIndex) => {
      const questionLines = doc.splitTextToSize(
        `${questionIndex + 1}. ${item.text}`,
        pageWidth - margin * 2,
      );

      const requiredHeight =
        questionLines.length * 5 +
        item.options.length * 7 +
        8;

      if (y + requiredHeight > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(questionLines, margin, y);

      y += questionLines.length * 5 + 3;

      doc.setFont('helvetica', 'normal');

      item.options.forEach((option) => {
        const optionLines = doc.splitTextToSize(
          option,
          pageWidth - margin * 2 - 10,
        );

        doc.rect(margin + 2, y - 3, 4, 4);
        doc.text(optionLines, margin + 10, y);

        y += optionLines.length * 5 + 2;
      });

      y += 4;
    });

    // Espacio final
    if (y > 205) {
      doc.addPage();
      y = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('REGISTRO DE REALIZACIÓN', margin, y);

    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    const declaration =
      'Declaro haber participado de la capacitación indicada y haber completado la evaluación precedente.';

    const declarationLines = doc.splitTextToSize(
      declaration,
      pageWidth - margin * 2,
    );

    doc.text(declarationLines, margin, y);

    y += declarationLines.length * 5 + 12;

    doc.text('Resultado: __________ / 5', margin, y);
    y += 12;

    doc.text('Firma del trabajador:', margin, y);
    doc.text('Firma del responsable:', 115, y);

    y += 25;

    doc.line(margin, y, 85, y);
    doc.line(115, y, pageWidth - margin, y);

    y += 6;

    doc.setFontSize(8);
    doc.text('Aclaración / DNI', margin, y);
    doc.text('Aclaración / Cargo', 115, y);

    y += 18;

    doc.setDrawColor(210);
    doc.line(margin, y, pageWidth - margin, y);

    y += 6;

    doc.setFontSize(7);
    doc.text(
      'Documento generado por Capacita-T · Registro para modalidad presencial',
      pageWidth / 2,
      y,
      { align: 'center' },
    );

    doc.save('capacitacion-epp-plantel-imprimible.pdf');
  };

  const handleLogin = async () => {
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Ingresá tu correo y contraseña.');
      return;
    }

    try {
      setLoginLoading(true);

      const response = await fetch('https://capacita-t-demo.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoginError(data.message || 'No se pudo iniciar sesión.');
        return;
      }

      localStorage.setItem('capacita_token', data.accessToken);
      localStorage.setItem('capacita_user', JSON.stringify(data.user));

      setAuthenticatedUser(data.user);

      if (data.user.role === 'admin') {
        setView('admin');
      } else {
        setView('employee');
      }
    } catch {
      setLoginError('No se pudo conectar con el servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('capacita_token');
    localStorage.removeItem('capacita_user');

    sessionStorage.setItem('capacita_logged_out', 'true');

    setAuthenticatedUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setLoginError('');

    setView('login');
  };

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

        <div className="header-actions">
          <span className="demo-badge">DEMO</span>

          {authenticatedUser && view === 'admin' ? (
            <div className="header-user">
              <div className="header-user-avatar">
                {authenticatedUser.firstName?.charAt(0)}
              </div>

              <div className="header-user-info">
                <strong>{authenticatedUser.firstName}</strong>
                <span>{authenticatedUser.company?.name}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="header-login-button"
              onClick={() => setView('login')}
            >
              Iniciar sesión
            </button>
          )}
        </div>
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

        {view === 'login' && (
          <section className="login-page">

            <div className="login-shell">

              <div className="login-info">

                <button
                  type="button"
                  className="login-back"
                  onClick={goHome}
                >
                  ← Volver al inicio
                </button>

                <span className="eyebrow">
                  ACCESO A CAPACITA-T
                </span>

                <h2>
                  Tu espacio de capacitación,
                  <span> en un solo lugar.</span>
                </h2>

                <p>
                  Accedé al entorno privado de tu empresa para gestionar
                  o realizar tus capacitaciones.
                </p>

                <div className="login-benefits">

                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Acceso seguro</strong>
                      Cada empresa cuenta con su propio espacio.
                    </p>
                  </div>

                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Información organizada</strong>
                      Capacitaciones, evaluaciones y constancias.
                    </p>
                  </div>

                  <div>
                    <span>✓</span>
                    <p>
                      <strong>Disponible desde cualquier lugar</strong>
                      Ingresá desde computadora, tablet o celular.
                    </p>
                  </div>

                </div>

              </div>

              <div className="login-card">

                <div className="login-card-header">
                  <img
                    src={logoCapacitaHeader}
                    alt="Capacita-T"
                    className="login-logo"
                  />

                  <h3>Iniciar sesión</h3>

                  <p>
                    Ingresá con los datos proporcionados por tu empresa.
                  </p>
                </div>

                <button
                  type="button"
                  className="google-login-button"
                >
                  <span className="google-icon">
                    <span className="google-g">G</span>
                  </span>

                  Continuar con Google
                </button>

                <div className="login-divider">
                  <span></span>
                  <small>o ingresá con tu correo</small>
                  <span></span>
                </div>

                <form
                  className="login-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >

                  <label>
                    Correo electrónico

                    <input
                      type="email"
                      placeholder="nombre@empresa.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    Contraseña

                    <input
                      type="password"
                      placeholder="Ingresá tu contraseña"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </label>

                  <div className="forgot-password">
                    <span>¿Olvidaste tu contraseña?</span>

                    <button
                      type="button"
                      onClick={() => {
                        setRecoveryStep('email')
                        setRecoveryEmail('')
                        setRecoveryCode('')
                        setShowRecovery(true)
                      }}
                    >
                      Hacé click aquí
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="primary login-submit"
                    disabled={loginLoading}
                  >
                    {loginLoading ? 'Ingresando...' : 'Ingresar'}
                  </button>
                  {loginError && (
                    <div className="login-error">
                      {loginError}
                    </div>
                  )}

                  <form
                    className="login-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                  >

                  </form>

                </form>

                <div className="login-help">
                  <strong>¿Tenés problemas para ingresar?</strong>

                  <span>
                    Contactá al administrador de tu empresa.
                  </span>
                </div>

                <div className="login-demo-note">
                  <span>¿Querés conocer Capacita-T?</span>

                  <button
                    type="button"
                    onClick={goHome}
                  >
                    Volver a la demostración
                  </button>
                </div>

              </div>

            </div>

          </section>
        )}

        {showRecovery && (
          <div
            className="recovery-overlay"
            onClick={() => setShowRecovery(false)}
          >
            <div
              className="recovery-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="recovery-close"
                onClick={() => setShowRecovery(false)}
              >
                ×
              </button>

              <img
                src={logoCapacitaHeader}
                alt="Capacita-T"
                className="recovery-logo"
              />

              {recoveryStep === 'email' && (
                <>
                  <span className="eyebrow">
                    RECUPERAR ACCESO
                  </span>

                  <h3>¿Olvidaste tu contraseña?</h3>

                  <p>
                    Ingresá el correo asociado a tu cuenta.
                    Te enviaremos un código de verificación.
                  </p>

                  <label className="recovery-field">
                    Correo electrónico

                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(event) =>
                        setRecoveryEmail(event.target.value)
                      }
                      placeholder="nombre@empresa.com"
                    />
                  </label>

                  <button
                    type="button"
                    className="primary recovery-primary"
                    disabled={!recoveryEmail.trim()}
                    onClick={() => setRecoveryStep('code')}
                  >
                    Enviar código
                  </button>
                </>
              )}

              {recoveryStep === 'code' && (
                <>
                  <span className="eyebrow">
                    VERIFICACIÓN
                  </span>

                  <h3>Revisá tu correo</h3>

                  <p>
                    Enviamos un código de 6 dígitos a
                    <strong> {recoveryEmail}</strong>.
                  </p>

                  <label className="recovery-field">
                    Código de verificación

                    <input
                      className="recovery-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={recoveryCode}
                      onChange={(event) =>
                        setRecoveryCode(
                          event.target.value.replace(/\D/g, '')
                        )
                      }
                      placeholder="000000"
                    />
                  </label>

                  <button
                    type="button"
                    className="primary recovery-primary"
                    disabled={recoveryCode.length !== 6}
                    onClick={() => setRecoveryStep('password')}
                  >
                    Verificar código
                  </button>

                  <button
                    type="button"
                    className="recovery-secondary"
                    onClick={() => setRecoveryStep('email')}
                  >
                    ← Cambiar correo
                  </button>
                </>
              )}

              {recoveryStep === 'password' && (
                <>
                  <span className="eyebrow">
                    NUEVA CONTRASEÑA
                  </span>

                  <h3>Creá una nueva contraseña</h3>

                  <p>
                    Tu identidad fue verificada correctamente.
                  </p>

                  <label className="recovery-field">
                    Nueva contraseña
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </label>

                  <label className="recovery-field">
                    Repetir contraseña
                    <input
                      type="password"
                      placeholder="••••••••"
                    />
                  </label>

                  <button
                    type="button"
                    className="primary recovery-primary"
                    onClick={() => {
                      setShowRecovery(false)
                      setRecoveryStep('email')
                    }}
                  >
                    Guardar nueva contraseña
                  </button>
                </>
              )}
            </div>
          </div>
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
              {questions[question].text}
            </h2>

            <div className="answers">
              {questions[question].options.map((answer, index) => (
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
                  setView('signature')
                }
              }}
            >
              {question < questions.length - 1
                ? 'Siguiente pregunta'
                : 'Continuar a la firma'}
            </button>
          </section>
        )}

        {view === 'signature' && (
          <section className="page narrow signature-page">

            <div className="employee-page-header">
              <span className="eyebrow">
                CONFIRMACIÓN DE CAPACITACIÓN
              </span>

              <button
                className="back-button"
                onClick={() => setView('evaluation')}
              >
                <span>←</span>
                Volver a la evaluación
              </button>
            </div>

            <h2>Firma del empleado</h2>

            <p className="signature-intro">
              La evaluación fue completada. Para finalizar la capacitación,
              firmá dentro del recuadro.
            </p>

            <div className="signature-summary">
              <div>
                <span>Empleado</span>
                <strong>Juan Pérez</strong>
                <small className="certificate-dni">
                  DNI 32.456.789
                </small>
              </div>

              <div>
                <span>Capacitación</span>
                <strong>Uso correcto de EPP</strong>
              </div>

              <div>
                <span>Confirmación</span>
                <strong>Realización de capacitación y evaluación</strong>
              </div>
            </div>

            <div className="signature-declaration">
              <span className="signature-check">✓</span>

              <p>
                Declaro haber realizado la capacitación
                <strong> “Uso correcto de EPP” </strong>
                y haber completado personalmente la evaluación correspondiente.
              </p>
            </div>

            <div className="signature-field">
              <div className="signature-field-header">
                <div>
                  <strong>Firma del empleado</strong>
                  <span>Firmá con el dedo o con el mouse</span>
                </div>

                <button
                  type="button"
                  className="clear-signature"
                  onClick={clearSignature}
                  disabled={!hasSignature}
                >
                  Borrar firma
                </button>
              </div>

              <canvas
                ref={signatureCanvasRef}
                className="signature-canvas"
                width={900}
                height={300}
                onPointerDown={startSignature}
                onPointerMove={drawSignature}
                onPointerUp={stopSignature}
                onPointerCancel={stopSignature}
                onPointerLeave={stopSignature}
              />

              <span className="signature-line-label">
                Firma
              </span>
            </div>

            {!hasSignature && (
              <p className="signature-help">
                ✍️ La firma es necesaria para finalizar la capacitación.
              </p>
            )}

            <button
              className="primary full signature-confirm"
              disabled={!hasSignature}
              onClick={confirmSignature}
            >
              Confirmar firma y finalizar
            </button>

            <p className="signature-legal-note">
              La firma quedará asociada al registro de realización de esta
              capacitación.
            </p>

          </section>
        )}

        {view === 'finished' && (
          <section className="page narrow centered completion-page">

            <div className="success">✓</div>

            <span className="eyebrow">CAPACITACIÓN FINALIZADA</span>

            <h2>Capacitación completada</h2>

            <p className="completion-intro">
              Gracias, Juan. Tu capacitación, evaluación y firma
              quedaron registradas correctamente.
            </p>

            <div className="completion-certificate">

              <div className="certificate-header">
                <div>
                  <span className="certificate-label">
                    CONSTANCIA DE REALIZACIÓN
                  </span>

                  <h3>
                    Uso correcto de elementos de protección personal
                  </h3>
                </div>

                <span className="certificate-status">
                  ✓ COMPLETADA
                </span>
              </div>

              <div className="certificate-data">

                <div>
                  <span>Empleado</span>
                  <strong>Juan Pérez</strong>
                </div>

                <div>
                  <span>Fecha y hora</span>
                  <strong>{signedAt}</strong>
                </div>

                <div>
                  <span>Evaluación</span>
                  <strong>Completada</strong>
                </div>

                <div>
                  <span>Resultado</span>
                  <strong>8/10</strong>
                </div>

                <div>
                  <span>Nº de constancia</span>
                  <strong>{certificateId}</strong>
                </div>

                <div>
                  <span>Estado</span>
                  <strong>Firmada</strong>
                </div>

              </div>

              <div className="certificate-declaration">
                <p>
                  El empleado declara haber realizado la capacitación
                  <strong> “Uso correcto de EPP” </strong>
                  y haber completado personalmente la evaluación
                  correspondiente.
                </p>
              </div>

              <div className="certificate-signature">

                <span>Firma registrada</span>

                {savedSignature && (
                  <img
                    src={savedSignature}
                    alt="Firma de Juan Pérez"
                  />
                )}

                <div className="certificate-signature-line">
                  <strong>Juan Pérez</strong>
                  <small>Firma del empleado</small>
                </div>

              </div>

              <div className="certificate-footer">
                <span>
                  Registro generado por <strong>Capacita-T</strong>
                </span>

                <span>
                  Formación que construye futuro
                </span>
              </div>

            </div>

            <div className="completion-actions">

              <button
                className="primary"
                onClick={downloadCertificate}
              >
                ↓ Descargar constancia
              </button>

              <button
                className="secondary"
                onClick={goHome}
              >
                Volver al inicio
              </button>

            </div>

          </section>
        )}

        {view === 'admin' && (
          <section className="dashboard">

            <div className="dashboard-title">
              <div>
                <p className="eyebrow">PANEL ADMINISTRADOR</p>

                <div className="admin-company-heading">
                  <div>
                    <h1>Resumen de capacitación</h1>

                  </div>

                  {authenticatedUser?.company && (
                    <div
                      className="company-identity company-identity-logo"
                      style={{
                        borderColor:
                          authenticatedUser.company.primaryColor || '#0b5cab',
                      }}
                    >
                      <img
                        src={plantelLogo}
                        alt="Plantel"
                        className="company-logo"
                      />

                      <div>
                        <span>Empresa</span>
                        <strong>{authenticatedUser.company.name}</strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-actions">
                <button
                  className="primary"
                  onClick={() => setView('new-training')}
                >
                  + Nueva capacitación
                </button>

                <button
                  type="button"
                  className="secondary"
                  onClick={handleLogout}
                >
                  Cerrar sesión
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
                <span>Promedio general</span>
                <strong>85%</strong>
              </article>
            </div>

            <div className="admin-training">
              <div className="admin-training-main">
                <span className="status active">ACTIVA</span>

                <h3>Uso correcto de elementos de protección personal</h3>

                <p className="admin-training-description">
                  Capacitación sobre selección, utilización, cuidado y control
                  de los elementos de protección personal durante las tareas laborales.
                </p>

                <div className="admin-training-actions">
                  <button
                    type="button"
                    className="training-action-button"
                    onClick={shareTrainingByWhatsApp}
                  >
                    📱 Enviar por WhatsApp
                  </button>

                  <button
                    type="button"
                    className="training-action-button secondary"
                    onClick={downloadPrintableTraining}
                  >
                    📄 Descargar versión imprimible
                  </button>
                </div>
              </div>

              <div className="dates">
                <span>🗓️ Apertura: 25/09/2026 · 08:00</span>
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

            {/* BIBLIOTECA DE CAPACITACIÓN */}
            <div className="training-library">
              <div className="training-library-header">
                <div>
                  <span className="eyebrow">RECURSOS PARA LA EMPRESA</span>
                  <h2>Biblioteca de capacitación</h2>
                  <p>
                    Accedé a recursos oficiales para complementar la
                    capacitación de tu equipo.
                  </p>
                </div>

                <a
                  className="library-main-link"
                  href="https://www.argentina.gob.ar/srt/capacitacion/aula-virtual"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ver Aula Virtual SRT ↗
                </a>
              </div>

              <div className="library-source">
                <span className="library-source-icon">🏛️</span>

                <div>
                  <strong>Superintendencia de Riesgos del Trabajo</strong>
                  <span>Recursos y capacitaciones oficiales</span>
                </div>
              </div>

              <div className="library-grid">
                <article className="library-card">
                  <div className="library-card-icon">🪜</div>

                  <span className="library-tag">
                    FUENTE OFICIAL · SRT
                  </span>

                  <h3>Trabajo en altura</h3>

                  <p>
                    Material oficial de referencia sobre prevención de riesgos
                    asociados a trabajos realizados en altura.
                  </p>

                  <div className="library-card-actions">
                    <a
                      href="https://www.argentina.gob.ar/sites/default/files/programa_trabajo_en_altura.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver material oficial ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        createTrainingFromLibrary(
                          'Trabajo en altura',
                          'Capacitación interna sobre prevención de riesgos asociados a trabajos realizados en altura.',
                          'Superintendencia de Riesgos del Trabajo (SRT)',
                          'Trabajo en altura',
                          'https://www.argentina.gob.ar/sites/default/files/programa_trabajo_en_altura.pdf',
                        )
                      }
                    >
                      + Crear capacitación con este material
                    </button>
                  </div>
                </article>

                <article className="library-card">
                  <div className="library-card-icon">🦺</div>

                  <span className="library-tag">
                    FUENTE OFICIAL · SRT
                  </span>

                  <h3>Elementos de protección personal</h3>

                  <p>
                    Material oficial de referencia sobre selección, utilización,
                    entrega y cuidado de elementos de protección personal.
                  </p>

                  <div className="library-card-actions">
                    <a
                      href="https://www.argentina.gob.ar/srt/prevencion/epp"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver material oficial ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        createTrainingFromLibrary(
                          'Elementos de protección personal',
                          'Capacitación interna sobre selección, utilización, cuidado y control de los elementos de protección personal.',
                          'Superintendencia de Riesgos del Trabajo (SRT)',
                          'Elementos de protección personal',
                          'https://www.argentina.gob.ar/srt/prevencion/epp',
                        )
                      }
                    >
                      + Crear capacitación con este material
                    </button>
                  </div>
                </article>

                <article className="library-card">
                  <div className="library-card-icon">🧍</div>

                  <span className="library-tag">
                    FUENTE OFICIAL · SRT
                  </span>

                  <h3>Introducción a la Ergonomía</h3>

                  <p>
                    Guía oficial de referencia para identificación de factores
                    de riesgo ergonómico y medidas preventivas.
                  </p>

                  <div className="library-card-actions">
                    <a
                      href="https://www.argentina.gob.ar/sites/default/files/res_srt_886_15-guia-practica.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver material oficial ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        createTrainingFromLibrary(
                          'Introducción a la Ergonomía',
                          'Capacitación interna sobre conceptos básicos de ergonomía, identificación de factores de riesgo y prevención en los puestos de trabajo.',
                          'Superintendencia de Riesgos del Trabajo (SRT)',
                          'Guía Práctica de Ergonomía',
                          'https://www.argentina.gob.ar/sites/default/files/res_srt_886_15-guia-practica.pdf',
                        )
                      }
                    >
                      + Crear capacitación con este material
                    </button>
                  </div>
                </article>

                <article className="library-card">
                  <div className="library-card-icon">💡</div>

                  <span className="library-tag">
                    FUENTE OFICIAL · SRT
                  </span>

                  <h3>Iluminación en el ámbito laboral</h3>

                  <p>
                    Guía oficial sobre iluminación, confort visual y prevención
                    de riesgos asociados a las condiciones del ambiente laboral.
                  </p>

                  <div className="library-card-actions">
                    <a
                      href="https://www.argentina.gob.ar/sites/default/files/res_srt_84_12-guia-practica.pdf"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver material oficial ↗
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        createTrainingFromLibrary(
                          'Iluminación en el ámbito laboral',
                          'Capacitación interna sobre condiciones de iluminación, confort visual y prevención de riesgos en el ambiente laboral.',
                          'Superintendencia de Riesgos del Trabajo (SRT)',
                          'Guía Práctica sobre Iluminación en el Ambiente Laboral',
                          'https://www.argentina.gob.ar/sites/default/files/res_srt_84_12-guia-practica.pdf',
                        )
                      }
                    >
                      + Crear capacitación con este material
                    </button>
                  </div>
                </article>
              </div>

              <p className="library-disclaimer">
                Los contenidos enlazados pertenecen a sus respectivos
                organismos oficiales. Capacita-T facilita el acceso a estos
                recursos y no reemplaza ni modifica su contenido.
              </p>
            </div>

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
                      value={newTrainingTitle}
                      onChange={(e) => setNewTrainingTitle(e.target.value)}
                    />
                  </label>

                  <label>
                    Descripción
                    <textarea
                      rows={4}
                      placeholder="Breve descripción de la capacitación..."
                      value={newTrainingDescription}
                      onChange={(e) => setNewTrainingDescription(e.target.value)}
                    />
                  </label>
                  {newTrainingSource && (
                    <div className="training-source-reference">
                      <span>🏛️ MATERIAL DE REFERENCIA</span>
                      <strong>{newTrainingSource}</strong>
                      <small>
                        Esta capacitación será elaborada por la empresa utilizando
                        material oficial como fuente de referencia.
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-section">
                <div className="section-number">2</div>

                <div className="section-content">
                  <h3>Material de capacitación</h3>

                  <p>
                    Agregá el contenido que deberán utilizar los empleados
                    durante la capacitación.
                  </p>

                  <div className="training-material-grid">

                    <div className="training-material-option">
                      <div className="training-material-option-header">
                        <span className="training-material-icon">▶️</span>

                        <div>
                          <strong>Video</strong>
                          <small>
                            Agregá un video propio o alojado en una plataforma externa.
                          </small>
                        </div>
                      </div>

                      <label>
                        URL del video
                        <input
                          type="url"
                          placeholder="https://..."
                        />
                      </label>
                    </div>

                    <div className="training-material-option">
                      <div className="training-material-option-header">
                        <span className="training-material-icon">📄</span>

                        <div>
                          <strong>Documento</strong>
                          <small>
                            Incorporá material en PDF para complementar la capacitación.
                          </small>
                        </div>
                      </div>

                      <label className="training-file-input">
                        Seleccionar PDF
                        <input
                          type="file"
                          accept="application/pdf"
                        />
                      </label>
                    </div>

                  </div>

                  {newTrainingSource && (
                    <div className="selected-reference-material">
                      <div className="selected-reference-icon">🏛️</div>

                      <div className="selected-reference-content">
                        <span>MATERIAL OFICIAL DE REFERENCIA</span>

                        <strong>
                          {newTrainingMaterialTitle}
                        </strong>

                        <small>
                          Fuente: {newTrainingSource}
                        </small>
                      </div>

                      <a
                        href={newTrainingMaterialUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver fuente ↗
                      </a>
                    </div>
                  )}

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
                    Creá las preguntas que deberán responder después de completar
                    el material de capacitación.
                  </p>

                  <div className="training-questions-list">
                    {newTrainingQuestions.map((questionItem, questionIndex) => (
                      <div
                        className="demo-question"
                        key={questionIndex}
                      >
                        <div className="demo-question-header">
                          <strong>
                            Pregunta {questionIndex + 1}
                          </strong>

                          <div className="question-header-actions">
                            <span>Multiple choice</span>

                            {newTrainingQuestions.length > 1 && (
                              <button
                                type="button"
                                className="remove-question-button"
                                onClick={() =>
                                  removeTrainingQuestion(questionIndex)
                                }
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Escribí la pregunta..."
                          value={questionItem.text}
                          onChange={(e) =>
                            updateTrainingQuestion(
                              questionIndex,
                              e.target.value,
                            )
                          }
                        />

                        {questionItem.options.map((option, optionIndex) => (
                          <div
                            className="option-input"
                            key={optionIndex}
                          >
                            <input
                              type="radio"
                              name={`correct-question-${questionIndex}`}
                              checked={questionItem.correctAnswer === optionIndex}
                              onChange={() =>
                                setNewTrainingQuestions((currentQuestions) =>
                                  currentQuestions.map((currentQuestion, index) =>
                                    index === questionIndex
                                      ? {
                                        ...currentQuestion,
                                        correctAnswer: optionIndex,
                                      }
                                      : currentQuestion
                                  )
                                )
                              }
                            />

                            <input
                              type="text"
                              placeholder={`Opción ${String.fromCharCode(65 + optionIndex)}`}
                              value={option}
                              onChange={(e) =>
                                updateTrainingOption(
                                  questionIndex,
                                  optionIndex,
                                  e.target.value,
                                )
                              }
                            />

                            {questionItem.options.length > 2 && (
                              <button
                                type="button"
                                className="remove-option-button"
                                onClick={() =>
                                  removeTrainingOption(questionIndex, optionIndex)
                                }
                                title="Eliminar opción"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          className="add-option-button"
                          onClick={() => addTrainingOption(questionIndex)}
                        >
                          + Agregar opción
                        </button>

                        <small>
                          Seleccioná el círculo correspondiente a la respuesta
                          correcta.
                        </small>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="add-question"
                    onClick={addTrainingQuestion}
                  >
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