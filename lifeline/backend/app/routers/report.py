from fastapi import APIRouter

from app.models.schemas import ReportIn, ReportOut
from app.services.jac_runtime import jac_runtime
from app.services.mongo import mongo_store

router = APIRouter(tags=["report"])


@router.post("/report", response_model=ReportOut)
def post_report(body: ReportIn) -> ReportOut:
    """Forward raw report to Jac ingest pipeline. No NLP in Python."""
    result = jac_runtime.ingest_report(
        text=body.text,
        source_name=body.source_name,
        source_kind=body.source_kind,
        channel=body.channel,
    )
    mongo_store.append_event({"type": "report_ingested", "payload": body.model_dump()})
    return ReportOut(
        status=result.get("status", "error"),
        report_id=result.get("report_id"),
        incident_id=result.get("incident_id"),
        message=result.get("message", ""),
        raw=result,
    )
