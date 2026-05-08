import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ToolHeader from '../toolbox/components/ToolHeader.jsx';
import SoftButton from '../emergency/components/SoftButton.jsx';
import { Loading } from '../../components/ui/Loading.jsx';
import EnvelopeHeader from './components/EnvelopeHeader.jsx';
import PatternsPills from './components/PatternsPills.jsx';
import SchemasPills from './components/SchemasPills.jsx';
import { getAnalysis, deleteAnalysis } from '../../utils/analysisStorage.js';
import { ANALYSIS_TYPES } from '../../data/analysisSchemas.js';

import EmotionRecognitionDetail from './details/EmotionRecognitionDetail.jsx';
import GratitudeDetail from './details/GratitudeDetail.jsx';
import ILanguageDetail from './details/ILanguageDetail.jsx';
import TherapySessionDetail from './details/TherapySessionDetail.jsx';
import MetaAnalysisDetail from './details/MetaAnalysisDetail.jsx';

const DETAIL_BY_TYPE = {
  emotion_recognition: EmotionRecognitionDetail,
  gratitude: GratitudeDetail,
  i_language: ILanguageDetail,
  therapy_session: TherapySessionDetail,
  meta_analysis: MetaAnalysisDetail,
};

export default function AnalysisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAnalysis(id).then((a) => {
      if (cancelled) return;
      if (!a) setNotFound(true);
      else setAnalysis(a);
    });
    return () => { cancelled = true; };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteAnalysis(id);
    const undo = res?.restorable ? { kind: 'analysis', id, title: analysis?.title } : null;
    navigate('/repository', { replace: true, state: undo ? { undo } : undefined });
  };

  if (notFound) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="ניתוח לא נמצא" backTo="/repository" />
        <main className="tool-content">
          <p className="ck-empty">הניתוח לא נמצא במאגר. ייתכן שנמחק או שלא הסתנכרן.</p>
        </main>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="tool-page ds2-themed">
        <ToolHeader title="טוען…" backTo="/repository" />
        <main className="tool-content">
          <Loading />
        </main>
      </div>
    );
  }

  const meta = ANALYSIS_TYPES[analysis.type];
  const DetailComponent = DETAIL_BY_TYPE[analysis.type];

  return (
    <div className="tool-page">
      <ToolHeader
        title={meta?.label || 'ניתוח'}
        subtitle={analysis.title}
        backTo="/repository"
      />
      <main className="tool-content analysis-detail">
        <EnvelopeHeader analysis={analysis} />

        <div className="detail-pills-row">
          <PatternsPills patterns={analysis.patterns} />
          <SchemasPills schemas={analysis.schemas_activated} />
        </div>

        {DetailComponent ? (
          <DetailComponent analysis={analysis} />
        ) : (
          <GenericFallback analysis={analysis} />
        )}

        <div className="analysis-detail-footer">
          {!confirmDelete && (
            <button type="button" className="link-btn link-danger" onClick={() => setConfirmDelete(true)}>
              מחק את הניתוח הזה
            </button>
          )}
          {confirmDelete && (
            <div className="delete-confirm">
              <p className="delete-confirm-text">פעולה זו תמחק את הניתוח לצמיתות. בטוח?</p>
              <div className="delete-confirm-row">
                <SoftButton onClick={handleDelete} disabled={deleting} className="is-destructive">
                  {deleting ? 'מוחק…' : 'כן, מחק'}
                </SoftButton>
                <button type="button" className="link-btn" onClick={() => setConfirmDelete(false)}>
                  ביטול
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GenericFallback({ analysis }) {
  return (
    <section className="generic-fallback">
      <h3 className="form-section-label">תוכן (תצוגה גנרית)</h3>
      <pre className="json-block">{JSON.stringify(analysis.payload, null, 2)}</pre>
    </section>
  );
}
