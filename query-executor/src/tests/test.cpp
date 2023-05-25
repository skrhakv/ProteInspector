#include <gtest/gtest.h>
#include "../core/operator-validator.hpp"
#include "../core/utils.hpp"
#include "../core/json-data-extractor.hpp"
#include "../core/expression-parser.hpp"
#include "../core/where-clause-parsers/regular-where-clause-parser.hpp"
#include "../core/metrics-parsers/count-metrics-parser.hpp"
#include "../core/metrics-parsers/selective-metrics-parser.hpp"
#include <iostream>
#include <string>

using namespace std;

TEST(OperatorValidatorLogicOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseLogicOperator(hsql::OperatorType::kOpAnd, a);
    EXPECT_EQ(a, "AND");

    string b;
    o.parseLogicOperator(hsql::OperatorType::kOpOr, b);
    EXPECT_EQ(b, "OR");
};

TEST(OperatorValidatorMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpEquals, a);
    EXPECT_EQ(a, "=");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpNotEquals, a);
    EXPECT_EQ(a, "!=");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpLess, a);
    EXPECT_EQ(a, "<");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpGreater, a);
    EXPECT_EQ(a, ">");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpGreaterEq, a);
    EXPECT_EQ(a, ">=");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpLessEq, a);
    EXPECT_EQ(a, "<=");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpPlus, a);
    EXPECT_EQ(a, "+");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpMinus, a);
    EXPECT_EQ(a, "-");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpAsterisk, a);
    EXPECT_EQ(a, "*");
    a = "";

    o.parseMathOperator(hsql::OperatorType::kOpSlash, a);
    EXPECT_EQ(a, "/");
    a = "";
};

TEST(TestUtilsToLower, BasicAssertions)
{
    string a = "hEllO WOrLd";
    toLower(a);
    EXPECT_EQ(a, "hello world");
};

TEST(TestBiologicalStructuresValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    bool x = extractor.ValidBiologicalStructure("proteins");
    EXPECT_TRUE(x);

    x = extractor.ValidBiologicalStructure("domains");
    EXPECT_TRUE(x);

    x = extractor.ValidBiologicalStructure("residues");
    EXPECT_TRUE(x);

    x = extractor.ValidBiologicalStructure("xxxx");
    EXPECT_FALSE(x);
};

TEST(TestQueryMetricValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    hsql::Expr *e = hsql::Expr::makeColumnRef("beforedomaincathid");
    string result;

    bool x = extractor.ValidateQueryMetric(e, "proteins", false, result);
    EXPECT_FALSE(x);

    x = extractor.ValidateQueryMetric(e, "domains", false, result);
    EXPECT_TRUE(true);
    EXPECT_EQ(result, "before_domains.cath_id");
};

TEST(TestDefaultMetricGetter, BasicAssertions)
{
    JsonDataExtractor extractor;
    string result;

    extractor.GetDefaultIdMetric("proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id AS \"id\"");
};

TEST(TestDatasetMetricGetter, BasicAssertions)
{
    JsonDataExtractor extractor;
    string result;

    extractor.GetDatasetIdMetric("proteins", 1, result);

    EXPECT_EQ(result, "transformations.dataset_id=1");
};

TEST(TestDefaultOrderGetter, BasicAssertions)
{
    JsonDataExtractor extractor;
    string result;

    extractor.GetDefaultOrder("proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id");
};

TEST(TestDefaultGroupByGetter, BasicAssertions)
{
    JsonDataExtractor extractor;
    string result;

    extractor.GetDefaultGroupBy("proteins", result);

    EXPECT_EQ(result, "protein_transformations.transformation_id");
};

TEST(TestExpressionParser, BasicAssertions)
{
    ExpressionParser parser;
    hsql::Expr *e1 = hsql::Expr::makeColumnRef("id");
    hsql::Expr *e2 = hsql::Expr::makeLiteral((int64_t)6);

    hsql::Expr *e = hsql::Expr::makeOpBinary(e1, hsql::OperatorType::kOpEquals, e2);
    string result;

    parser.Parse(e, "proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id = 6");

    e1 = hsql::Expr::makeColumnRef("beforepdbid");
    e2 = hsql::Expr::makeColumnRef("5b02");
    e = hsql::Expr::makeOpBinary(e1, hsql::OperatorType::kOpEquals, e2);
    result = "";

    parser.Parse(e, "proteins", result);

    EXPECT_EQ(result, "before_proteins.pdb_code = '5b02'");
};

TEST(TestWhereClauseParser, BasicAssertions)
{
    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS WHERE id = 6", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    RegularWhereClauseParser parser(false);
    string result;

    parser.Parse((const hsql::SelectStatement *)statement, "proteins", 1, result);

    EXPECT_EQ(result, " WHERE (protein_transformations.protein_transformation_id = 6) AND transformations.dataset_id=1");
};

TEST(TestCountMetricsParser, BasicAssertions)
{
    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS WHERE id = 6", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    CountMetricsParser parser;
    string result;

    ((MetricsParser *)&parser)->Parse((const hsql::SelectStatement *)statement, "proteins", result);

    EXPECT_EQ(result, "COUNT(*)");
};

TEST(TestSelectiveMetricsParser, BasicAssertions)
{
    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT AfterChainId, AfterFileLocation FROM PROTEINS WHERE id = 6", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    SelectiveMetricsParser parser;
    string result;

    ((MetricsParser *)&parser)->Parse((const hsql::SelectStatement *)statement, "proteins", result);

    EXPECT_EQ(result, "after_proteins.chain_id AS \"AfterChainId\",after_proteins.file_location AS \"AfterFileLocation\", protein_transformations.protein_transformation_id AS \"id\"");
};

int main(int argc, char **argv)
{
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}