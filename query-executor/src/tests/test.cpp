#include <gtest/gtest.h>
#include "../core/operator-validator.hpp"
#include "../core/utils.hpp"
#include "../core/json-data-extractor.hpp"
#include "../core/expression-parser.hpp"
#include "../core/where-clause-parsers/regular-where-clause-parser.hpp"
#include "../core/where-clause-parsers/wrapper-where-clause-parser.hpp"
#include "../core/metrics-parsers/count-metrics-parser.hpp"
#include "../core/metrics-parsers/selective-metrics-parser.hpp"
#include "../core/limit-clause-parsers/regular-limit-clause-parser.hpp"
#include "../core/limit-clause-parsers/empty-limit-clause-parser.hpp"
#include "../core/order-by-parser.hpp"
#include <iostream>
#include <string>

using namespace std;

TEST(AndLogicOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseLogicOperator(hsql::OperatorType::kOpAnd, a);
    EXPECT_EQ(a, "AND");
};

TEST(OrLogicOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string b;
    o.parseLogicOperator(hsql::OperatorType::kOpOr, b);
    EXPECT_EQ(b, "OR");
};

TEST(EqualMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpEquals, a);
    EXPECT_EQ(a, "=");
};

TEST(NotEqualMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpNotEquals, a);
    EXPECT_EQ(a, "!=");
};

TEST(LessThanMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpLess, a);
    EXPECT_EQ(a, "<");
};

TEST(LessThanEqualMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpLessEq, a);
    EXPECT_EQ(a, "<=");
};

TEST(GreaterThanMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpGreater, a);
    EXPECT_EQ(a, ">");
};

TEST(GreaterThanEqualMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpGreaterEq, a);
    EXPECT_EQ(a, ">=");
};

TEST(PlusMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpPlus, a);
    EXPECT_EQ(a, "+");
};

TEST(MinusMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpMinus, a);
    EXPECT_EQ(a, "-");
};

TEST(AsteriskMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpAsterisk, a);
    EXPECT_EQ(a, "*");
};

TEST(SlashMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    o.parseMathOperator(hsql::OperatorType::kOpSlash, a);
    EXPECT_EQ(a, "/");
};

TEST(UnsupportedMathOperatorTest, BasicAssertions)
{
    OperatorValidator o;
    string a;
    bool x = o.parseMathOperator(hsql::OperatorType::kOpLike, a);
    EXPECT_FALSE(x);
};

TEST(TestUtilsToLower, BasicAssertions)
{
    string a = "hEllO WOrLd";
    toLower(a);
    EXPECT_EQ(a, "hello world");
};

TEST(TestProteinsBiologicalStructuresValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    bool x = extractor.ValidBiologicalStructure("proteins");
    EXPECT_TRUE(x);
};

TEST(TestDomainsBiologicalStructuresValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    bool x = extractor.ValidBiologicalStructure("domains");
    EXPECT_TRUE(x);
};

TEST(TestResiduesBiologicalStructuresValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    bool x = extractor.ValidBiologicalStructure("residues");
    EXPECT_TRUE(x);
};

TEST(TestUnsupportedBiologicalStructuresValidation, BasicAssertions)
{
    JsonDataExtractor extractor;
    bool x = extractor.ValidBiologicalStructure("xxx");
    EXPECT_FALSE(x);
};

TEST(TestLiteralParsing, BasicAssertions)
{
    JsonDataExtractor extractor;
    string a;
    extractor.ParseValue(hsql::Expr::makeLiteral((int64_t)6), "proteins", a);
    EXPECT_EQ(a, "6");
};

TEST(TestFloatParsing, BasicAssertions)
{
    JsonDataExtractor extractor;
    string a;
    extractor.ParseValue(hsql::Expr::makeLiteral((double)6.5), "proteins", a);
    EXPECT_EQ(a.substr(0, 3), "6.5");
};

TEST(TestStringParsing, BasicAssertions)
{
    JsonDataExtractor extractor;
    string a;
    extractor.ParseValue(hsql::Expr::makeColumnRef("id"), "proteins", a);
    EXPECT_EQ(a, "protein_transformations.protein_transformation_id");
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

TEST(TestLiteralExpressionParser, BasicAssertions)
{
    ExpressionParser parser;
    hsql::Expr *e1 = hsql::Expr::makeColumnRef("id");
    hsql::Expr *e2 = hsql::Expr::makeLiteral((int64_t)6);

    hsql::Expr *e = hsql::Expr::makeOpBinary(e1, hsql::OperatorType::kOpEquals, e2);
    string result;

    parser.Parse(e, "proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id = 6");
};

TEST(TestStringExpressionParser, BasicAssertions)
{
    ExpressionParser parser;

    hsql::Expr *e1 = hsql::Expr::makeColumnRef("beforepdbid");
    hsql::Expr *e2 = hsql::Expr::makeColumnRef("5b02");
    hsql::Expr *e = hsql::Expr::makeOpBinary(e1, hsql::OperatorType::kOpEquals, e2);
    string result;

    parser.Parse(e, "proteins", result);

    EXPECT_EQ(result, "before_proteins.pdb_code = '5b02'");
};

TEST(TestRegularWhereClauseParser, BasicAssertions)
{
    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS WHERE id = 6", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    RegularWhereClauseParser parser(false);
    string result;

    parser.Parse((const hsql::SelectStatement *)statement, "proteins", 1, result);

    EXPECT_EQ(result, " WHERE (protein_transformations.protein_transformation_id = 6) AND transformations.dataset_id=1");
};

TEST(TestWrapperWhereClauseParser, BasicAssertions)
{
    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS WHERE id = 6", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    WrapperWhereClauseParser parser(0, 100);
    string result;

    parser.Parse((const hsql::SelectStatement *)statement, "proteins", 1, result);

    EXPECT_EQ(result.substr(0, 86), " WHERE transformations.dataset_id=1 AND protein_transformations.transformation_id IN (");
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

TEST(TestOrderByParserAsc, BasicAssertions)
{

    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS ORDER BY id ASC", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    JsonDataExtractor extractor;
    OrderByParser parser(extractor);
    string result;

    parser.Parse(((const hsql::SelectStatement *)statement)->order, "proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id");
};

TEST(TestOrderByParser, BasicAssertions)
{

    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS ORDER BY id", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    JsonDataExtractor extractor;
    OrderByParser parser(extractor);
    string result;

    parser.Parse(((const hsql::SelectStatement *)statement)->order, "proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id");
};

TEST(TestOrderByParserDesc, BasicAssertions)
{

    hsql::SQLParserResult parsedQuery;

    hsql::SQLParser::parse("SELECT * FROM PROTEINS ORDER BY id DESC", &parsedQuery);

    const hsql::SQLStatement *statement = parsedQuery.getStatement(0);

    JsonDataExtractor extractor;
    OrderByParser parser(extractor);
    string result;

    parser.Parse(((const hsql::SelectStatement *)statement)->order, "proteins", result);

    EXPECT_EQ(result, "protein_transformations.protein_transformation_id DESC");
};

TEST(TestRegularLimitClauseParser, BasicAssertions)
{
    RegularLimitClauseParser parser;
    string result;

    ((LimitClauseParser *)&parser)->Parse(0, 100, result);

    EXPECT_EQ(result, " LIMIT 100 OFFSET 0");
};

TEST(TestEmptyLimitClauseParser, BasicAssertions)
{
    EmptyLimitClauseParser parser;
    string result;

    ((LimitClauseParser *)&parser)->Parse(0, 100, result);

    EXPECT_EQ(result, "");
};

int main(int argc, char **argv)
{
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}