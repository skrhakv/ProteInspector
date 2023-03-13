import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppSettings } from '../app-settings';
import { Dataset } from '../models/dataset';
import { of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DatasetService {
    public datasets: Dataset[] = [];
    public SelectedDataset!: Dataset;
    constructor(private http: HttpClient) {
        this.getDatasetInfo();
    }

    getDatasetInfo() {
        const headers = new HttpHeaders({
            'Access-Control-Allow-Origin': AppSettings.API_ENDPOINT
        });
        const options = {
            headers
        };
        return this.http.get<any>(AppSettings.API_ENDPOINT + `/datasets-info`, options).subscribe((datasetsResult) => {
            this.datasets = datasetsResult['results'];
        });
    }

    selectDataset(dataset: Dataset) {
        this.SelectedDataset = dataset;
    }

    getQueryData(query: string, page: number) {
        // TODO: connect the service with real backend, this is just a simulation
        let x =
        {
            "columnNames": [
                "AfterChainId",
                "AfterPdbCode",
                "BeforeChainId",
                "BeforePdbCode",
                "CompareSecondaryStructure",
                "Rmsd",
                "UniprotId"
            ],
            "results": [
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "4gux",
                    "CompareSecondaryStructure": "0.9910313901345291",
                    "Rmsd": "0.4295603648418623",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btg",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.33976801153194985",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "4gux",
                    "CompareSecondaryStructure": "0.9865470852017937",
                    "Rmsd": "0.45939080880350214",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1c1o",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3031976651971109",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "4gux",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.45302317206458975",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "6mrq",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.359015689946466",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1c2l",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.3566811296177487",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1btp",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.2242777863340499",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1g9i",
                    "CompareSecondaryStructure": "0.9910313901345291",
                    "Rmsd": "0.2391903006728202",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1ejm",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.7032400176853384",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1c2m",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3196315308849914",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1p2j",
                    "CompareSecondaryStructure": "0.9954545454545455",
                    "Rmsd": "0.339611137288715",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1s0q",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.29274228681866177",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1p2k",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3582140757080476",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1utq",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.34373794453658557",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tgb",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.463637831065015",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1ppe",
                    "CompareSecondaryStructure": "0.9820627802690582",
                    "Rmsd": "0.38476758118769305",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2g55",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.3308247769621291",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "2fi3",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.34312473539307486",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2a7h",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3921988028942347",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3bth",
                    "CompareSecondaryStructure": "0.9864253393665159",
                    "Rmsd": "0.3193391468822667",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "2ptc",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.33360280775292045",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btd",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3364292022871378",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2ptn",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.2779436689035617",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3bte",
                    "CompareSecondaryStructure": "0.9775784753363229",
                    "Rmsd": "0.3536776668005788",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btt",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3216980979765056",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btk",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3307947332882181",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btm",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3337221472436338",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3otj",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.2929838140745958",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btq",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.33372359530743",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "3m7q",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.4452378744151855",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btw",
                    "CompareSecondaryStructure": "0.9954954954954955",
                    "Rmsd": "0.37186841494652906",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "5mne",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.26616277571452684",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "4aoq",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.31972533541096765",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "4aor",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.31184149500764125",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "5mop",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.26626202213423156",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "5mnf",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.26454751072899213",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "4aoq",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3273841302505786",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5736971196761578",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.574371376256794",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "F",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.526697405085406",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "5mnz",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.26936218508747173",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5395263691121581",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5921529575874357",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5899803595460629",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "F",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.5087673467321058",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "D",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.5337425208927072",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.602526687750176",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6329656995327342",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.658273643300469",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "D",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6181633464685936",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "2iln",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3268058762917179",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "D",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6090524817188115",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2cmy",
                    "CompareSecondaryStructure": "0.9820627802690582",
                    "Rmsd": "0.24496715820918763",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6495593995919884",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1f2s",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.35126629236504936",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "3ptn",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.31489783015519335",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3d65",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.32551028511964286",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2iln",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.34551822118392167",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1p2i",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.34734404232110366",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1c5v",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.3145644893826604",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "4j2y",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.47922369209260496",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1ejm",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.7422837901456446",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "Z",
                    "BeforePdbCode": "1tgs",
                    "CompareSecondaryStructure": "0.9372197309417041",
                    "Rmsd": "1.1716542089277604",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "1ejm",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.7141311400055284",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tgc",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.4759985771498621",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tld",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.1718644995422951",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2tga",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.4803561592213259",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "2btc",
                    "CompareSecondaryStructure": "0.9910313901345291",
                    "Rmsd": "0.3606863211749288",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2uuy",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.3271406528819979",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "2f3c",
                    "CompareSecondaryStructure": "0.9864253393665159",
                    "Rmsd": "0.5609275507635698",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "2tgt",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "1.314899018920849",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "2xtt",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.38563111156730345",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "3btf",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.31061726479312335",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "5k7r",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5309942057824987",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "3e8l",
                    "CompareSecondaryStructure": "0.9910313901345291",
                    "Rmsd": "0.4004327485907958",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "3rdz",
                    "CompareSecondaryStructure": "0.990909090909091",
                    "Rmsd": "0.3704586628793037",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "3rdz",
                    "CompareSecondaryStructure": "0.990909090909091",
                    "Rmsd": "0.3779774114842147",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5589562488468238",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "3i29",
                    "CompareSecondaryStructure": "0.9775784753363229",
                    "Rmsd": "0.4631497015979246",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5603788379122875",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "6dwh",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5823011403721171",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "D",
                    "BeforePdbCode": "6dwf",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.5429914646767441",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "C",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6667632530506566",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.7186660286174387",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1tab",
                    "CompareSecondaryStructure": "0.9641255605381166",
                    "Rmsd": "0.39507844447306695",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "B",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "0.9910313901345291",
                    "Rmsd": "0.6181543804398985",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6341633132194894",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "F",
                    "BeforePdbCode": "7jr2",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.6459926984511757",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "F",
                    "BeforePdbCode": "7jr1",
                    "CompareSecondaryStructure": "0.9865470852017937",
                    "Rmsd": "0.7057179627100872",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tgn",
                    "CompareSecondaryStructure": "0.9864864864864865",
                    "Rmsd": "1.957378883873658",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tgt",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "1.2802003768638037",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "E",
                    "BeforePdbCode": "1tpa",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.32015873701062747",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1d6r",
                    "CompareSecondaryStructure": "0.968609865470852",
                    "Rmsd": "0.3321754490605552",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "A",
                    "BeforePdbCode": "1tpo",
                    "CompareSecondaryStructure": "1",
                    "Rmsd": "0.28774728536008437",
                    "UniprotId": "P00760"
                },
                {
                    "AfterChainId": "A",
                    "AfterPdbCode": "1btw",
                    "BeforeChainId": "Z",
                    "BeforePdbCode": "2tgp",
                    "CompareSecondaryStructure": "0.9955156950672646",
                    "Rmsd": "0.929821957600848",
                    "UniprotId": "P00760"
                }
            ]
        }
        return of(x);
    }

    getNumberOfPages(query: string) {
        return of(16);
    }
}
