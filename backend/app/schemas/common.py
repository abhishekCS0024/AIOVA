from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class EvidenceRef(BaseModel):
    document: str
    quote: str
    supports: bool = True
